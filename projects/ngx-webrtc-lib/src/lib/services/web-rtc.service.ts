import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
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
import { BehaviorSubject, concatMap, from, interval, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AgoraConfig, DEFAULT_STREAM_STATE, StreamState } from '../models';
import { DefaultSpeechRecognition } from './transcript/default-speech-recognition.service';
import { TranscriptHandler } from './transcript/transcript-handler.service';

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
  private readonly streamState = new BehaviorSubject<StreamState>(DEFAULT_STREAM_STATE);
  private readonly remoteStreamVideoToggle = new BehaviorSubject<boolean>(true);
  private readonly remoteStreamAudioToggle = new BehaviorSubject<boolean>(true);
  private readonly transcriptToggle = new BehaviorSubject<boolean>(false);
  private readonly trancriptStream = new BehaviorSubject<string>('');
  private readonly callEnd = new Subject<void>();

  public localContainerId = 'local-video';
  public remoteCalls: string[] = [];
  public remoteStreamVideoToggle$ = this.remoteStreamVideoToggle.asObservable();
  public remoteStreamAudioToggle$ = this.remoteStreamAudioToggle.asObservable();
  public streamState$ = this.streamState.asObservable();
  public trancriptStream$ = this.trancriptStream.asObservable();
  public transcriptEnabled$ = this.transcriptToggle.asObservable();

  constructor(
    @Inject('AgoraConfig') private config: AgoraConfig,
    @Inject(PLATFORM_ID) private platformId: object,
    @Optional() private transcriptHandler?: TranscriptHandler,
  ) {
    if (!this.transcriptHandler && this.useTranscription()) {
      this.transcriptHandler = new DefaultSpeechRecognition(this.trancriptStream);
    }
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
    this.stopTranscript();
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

  useTranscription(): boolean {
    return !!this.config.useTranscription && isPlatformBrowser(this.platformId);
  }

  startTranscript(): void {
    this.transcriptToggle.next(true);
    this.transcriptHandler?.onStartTranscript();
  }

  stopTranscript(): void {
    this.transcriptToggle.next(false);
    this.trancriptStream.next('');
    this.transcriptHandler?.onStopTranscript();
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
