import { Inject, Injectable } from '@angular/core';
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
  IMicrophoneAudioTrack,
  IRemoteDataChannel,
  IRemoteTrack,
  UID,
} from 'agora-rtc-sdk-ng';
import { BehaviorSubject, Observable, Subject, concatMap, from, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { AgoraConfig, DEFAULT_STREAM_STATE, StreamState } from '../models';

const CLIENT_CONFIG: ClientConfig = {
  mode: 'rtc',
  codec: 'h264',
};

@Injectable()
export class WebRtcService {
  private agoraRTC: IAgoraRTC;
  private virtualBackgroundProcessor: IVirtualBackgroundProcessor;
  private virtualBackgroundExtension: IVirtualBackgroundExtension;
  private client: IAgoraRTCClient;
  private localTracks: { videoTrack: ICameraVideoTrack, audioTrack: IMicrophoneAudioTrack };
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

  constructor(@Inject('AgoraConfig') private config: AgoraConfig) {
  }

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
              this.client.publish(Object.values(this.localTracks));
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

  toggleFullScreen(enabled: boolean): void {
    enabled ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  }

  toggleBlur(enabled: boolean) {
    this.virtualBackgroundProcessor[enabled ? 'disable' : 'enable']();
  }

  isVideoEnabled(): boolean {
    if (this.localTracks) {
      return !this.localTracks.videoTrack.muted;
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
    return Promise.all([
      this.agoraRTC.createCameraVideoTrack({
        encoderConfig: '720p_1',
      }),
      this.agoraRTC.createMicrophoneAudioTrack()
    ]).then(([videoTrack, audioTrack]) => {
      this.localTracks = { audioTrack, videoTrack };

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
      Object.values(this.localTracks).forEach((track: ICameraVideoTrack | IMicrophoneAudioTrack) => {
        track.stop();
        track.close();
      });
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
