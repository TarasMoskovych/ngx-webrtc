import { inject, Injectable } from '@angular/core';
import {
  IVirtualBackgroundExtension,
  IVirtualBackgroundProcessor,
} from 'agora-extension-virtual-background';
import {
  ClientConfig,
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteDataChannel,
  IRemoteTrack,
  UID,
} from 'agora-rtc-sdk-ng';
import { BehaviorSubject, concatMap, from, interval, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AGORA_CONFIG, DEFAULT_STREAM_STATE, StreamState } from '../models';

const CLIENT_CONFIG: ClientConfig = {
  mode: 'rtc',
  codec: 'h264',
};

@Injectable()
export class WebRtcService {
  private readonly config = inject(AGORA_CONFIG);
  private agoraRTC: IAgoraRTC;
  private virtualBackgroundProcessor: IVirtualBackgroundProcessor;
  private virtualBackgroundExtension: IVirtualBackgroundExtension;
  private client: IAgoraRTCClient;
  private localTracks: {
    videoTrack: ICameraVideoTrack,
    audioTrack: IMicrophoneAudioTrack,
    screenTrack?: ILocalVideoTrack,
  };
  private uid: string;
  private streamState = new BehaviorSubject<StreamState>(DEFAULT_STREAM_STATE);
  private remoteStreamVideoToggle = new BehaviorSubject<boolean>(true);
  private remoteStreamAudioToggle = new BehaviorSubject<boolean>(true);
  private callEnd = new Subject<void>();

  public localContainerId = 'local-video';
  public remoteCalls: string[] = [];
  public remoteStreamVideoToggle$ = this.remoteStreamVideoToggle.asObservable();
  public remoteStreamAudioToggle$ = this.remoteStreamAudioToggle.asObservable();
  public streamState$ = this.streamState.asObservable();

  init(uid: string, channel: string, token: string | null): Observable<void> {
    return from(this.loadSDK()).pipe(
      concatMap(() => {
        this.uid = uid;
        this.agoraRTC.setLogLevel(this.config.debug ? 0 : 4);

        this.client = this.agoraRTC.createClient(CLIENT_CONFIG);
        this.assignClientHandlers();

        this.initLocalStream().then(() => {
          this.client.join(this.config.AppID, channel, token || null, this.uid)
            .then(() => {
              this.localTracks.videoTrack.play(this.localContainerId);
              this.client.publish(Object.values(this.localTracks).filter(Boolean));
              this.streamState.next({ ...this.streamState.value, connected: true, statusText: 'Waiting remote to join' });
            })
            .catch((err: Error) => this.handleError(err));
        });

        return this.callEnd.asObservable();
      }),
    );
  }

  deinit(): void {
    this.streamState.next(DEFAULT_STREAM_STATE);
    this.remoteStreamAudioToggle.next(true);
    this.remoteStreamVideoToggle.next(true);
  }

  endCall(): void {
    this.client.leave().then(() => {
      this.stopLocalStream();
      this.streamState.next({ ...this.streamState.value, started: null, loading: true, statusText: '', ended: true });
      this.remoteCalls = [];

      interval(500)
        .pipe(take(1))
        .subscribe(() => this.callEnd.next());
    });
  }

  toggleVideo(enabled: boolean): void {
    if (this.localTracks) {
      this.localTracks.videoTrack.setMuted(enabled);
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localTracks) {
      this.localTracks.audioTrack.setMuted(enabled);
    }
  }

  async toggleScreenShare(enabled: boolean): Promise<void> {
    if (!enabled) {
      const screenTrack = await this.createScreenVideoTrack();
      this.localTracks = { ...this.localTracks, screenTrack };

      await this.unpublishLocalTrack(this.localTracks.videoTrack);
      await this.client.publish(screenTrack);

      screenTrack.on('track-ended', () => this.onScreenShareEnded(screenTrack));
    } else if (this.localTracks?.screenTrack) {
      this.onScreenShareEnded(this.localTracks.screenTrack);
    }
  }

  toggleFullScreen(enabled: boolean): void {
    enabled ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  }

  toggleBlur(enabled: boolean) {
    this.virtualBackgroundProcessor[enabled ? 'disable' : 'enable']();
  }

  isVideoEnabled(): boolean {
    if (this.localTracks) {
      return !this.localTracks.videoTrack.muted && !this.localTracks.screenTrack;
    }

    return false;
  }

  isAudioEnabled(): boolean {
    if (this.localTracks) {
      return !this.localTracks.audioTrack.muted;
    }

    return false;
  }

  isBlurEnabled(): boolean {
    return this.virtualBackgroundProcessor?.enabled;
  }

  isScreenShared(): boolean {
    return !!this.localTracks?.screenTrack;
  }

  useVirtualBackground(): boolean {
    return !!this.config.useVirtualBackground;
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvents.UserJoined, (user: IAgoraRTCRemoteUser) => {
      this.streamState.next({ ...this.streamState.value, started: Date.now(), loading: false });

      if (!this.remoteCalls.length) {
        this.remoteCalls.push(this.getRemoteId(user));
      }
    });

    this.client.on(ClientEvents.UserPublished, (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      const remoteCall = this.getRemoteId(user);
      this.client.subscribe(user, mediaType).then((track: IRemoteTrack | IRemoteDataChannel) => {
        if (this.remoteCalls.includes(remoteCall)) {
          (track as IRemoteTrack).play(remoteCall);
        }
      });
    });

    this.client.on(ClientEvents.UserInfoUpdated, (uid: UID, msg: UserInfoUpdatedMessages) => {
      switch (msg) {
        case UserInfoUpdatedMessages.MuteAudio:
          this.remoteStreamAudioToggle.next(false);
          break;
        case UserInfoUpdatedMessages.UnmuteAudio:
          this.remoteStreamAudioToggle.next(true);
          break;
        case UserInfoUpdatedMessages.MuteVideo:
          this.remoteStreamVideoToggle.next(false);
          break;
        case UserInfoUpdatedMessages.UnmuteVideo:
          this.remoteStreamVideoToggle.next(true);
          break;
      }
    });

    this.client.on(ClientEvents.UserLeft, () => {
      this.endCall();
    });
  }

  private initLocalStream(): Promise<void> {
    const existingAudioTrack = this.localTracks?.audioTrack;
    return Promise.all([
      this.createCameraVideoTrack(),
      existingAudioTrack ? Promise.resolve(existingAudioTrack) : this.createMicrophoneAudioTrack(),
    ]).then(([videoTrack, audioTrack]) => {
      this.localTracks = { audioTrack, videoTrack, screenTrack: undefined };

      if (this.virtualBackgroundExtension) {
        return this.initVirtualBackgroundProcessor();
      }

      return Promise.resolve();
    }).catch((error: Error) => {
      this.handleError(error);
    });
  }

  private getRemoteId(user: IAgoraRTCRemoteUser): string {
    return `remote_call-${user.uid}`;
  }

  private handleError(error: Error): void {
    this.streamState.next({ ...this.streamState.value, statusText: error.message, error: true });
    this.stopLocalStream();

    interval(5000)
      .pipe(take(1))
      .subscribe(() => this.callEnd.next());

    throw new Error(error.message);
  }

  private stopLocalStream(): void {
    if (this.localTracks) {
      Object.values(this.localTracks).forEach((track: LocalTrack) => this.stopLocalTrack(track));
    }
  }

  private async loadSDK(): Promise<void> {
    if (!this.agoraRTC) {
      const { default: AgoraRTC } = await import('agora-rtc-sdk-ng');
      this.agoraRTC = AgoraRTC;
    }

    if (!this.virtualBackgroundExtension && this.config.useVirtualBackground) {
      const { default: VirtualBackgroundExtension } = await import('agora-extension-virtual-background');
      this.virtualBackgroundExtension = new VirtualBackgroundExtension();
      this.agoraRTC.registerExtensions([this.virtualBackgroundExtension]);
    }

    if (!this.agoraRTC.checkSystemRequirements()) {
      this.handleError(new Error('Web RTC is not supported in this browser'));
    }
  }

  private async initVirtualBackgroundProcessor(): Promise<void> {
    this.virtualBackgroundProcessor = this.virtualBackgroundExtension.createProcessor();
    await this.virtualBackgroundProcessor.init();

    this.localTracks.videoTrack.pipe(this.virtualBackgroundProcessor).pipe(this.localTracks.videoTrack.processorDestination);
    this.virtualBackgroundProcessor.setOptions({ type: 'blur', blurDegree: 2 });
  }

  private createCameraVideoTrack(): Promise<ICameraVideoTrack> {
    return this.agoraRTC.createCameraVideoTrack({
      encoderConfig: '720p_1',
    });
  }

  private createMicrophoneAudioTrack(): Promise<IMicrophoneAudioTrack> {
    return this.agoraRTC.createMicrophoneAudioTrack();
  }

  private createScreenVideoTrack(): Promise<ILocalVideoTrack> {
    return this.agoraRTC.createScreenVideoTrack({
      encoderConfig: '720p_1',
    }).then((screenTrack) => screenTrack as ILocalVideoTrack);
  }

  private async onScreenShareEnded(screenTrack: ILocalVideoTrack): Promise<void> {
    await this.unpublishLocalTrack(screenTrack);
    await this.initLocalStream();

    this.localTracks.videoTrack.play(this.localContainerId);
    await this.client.publish(this.localTracks.videoTrack);
  }

  private async unpublishLocalTrack(track: LocalTrack): Promise<void> {
    await this.client.unpublish(track);
    this.stopLocalTrack(track);
  }

  private stopLocalTrack(track: LocalTrack): void {
    if (track) {
      track.stop();
      track.close();
    }
  }
}

export enum ClientEvents {
  UserJoined = 'user-joined',
  UserPublished = 'user-published',
  UserInfoUpdated = 'user-info-updated',
  UserLeft = 'user-left',
}

export enum UserInfoUpdatedMessages {
  MuteAudio = 'mute-audio',
  UnmuteAudio = 'unmute-audio',
  MuteVideo = 'mute-video',
  UnmuteVideo = 'unmute-video',
}

export type LocalTrack = ICameraVideoTrack | IMicrophoneAudioTrack | ILocalVideoTrack;
