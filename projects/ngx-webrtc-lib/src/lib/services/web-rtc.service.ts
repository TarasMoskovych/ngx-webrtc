import { Injectable } from '@angular/core';
import { AgoraClient, ClientConfig, ClientEvent, NgxAgoraService, Stream, StreamSpec } from 'ngx-agora';
import { BehaviorSubject, interval, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { StreamState, DEFAULT_STREAM_STATE } from '../models';

const CLIENT_CONFIG: ClientConfig = {
  mode: 'rtc',
  codec: 'h264',
};

const STREAM_SPEC: StreamSpec = {
  audio: true,
  video: true,
  screen: false,
};

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {
  private client: AgoraClient;
  private localStream: Stream;
  private uid: string;
  private streamState = new BehaviorSubject<StreamState>(DEFAULT_STREAM_STATE);
  private remoteStreamVideoToggle = new BehaviorSubject<boolean>(true);
  private callEnd = new Subject<void>();

  public localContainerId = 'local-video';
  public remoteCalls: string[] = [];
  public remoteStreamVideoToggle$ = this.remoteStreamVideoToggle.asObservable();
  public streamState$ = this.streamState.asObservable();

  constructor(private ngxAgoraService: NgxAgoraService) { }

  init(uid: string, channel: string, debug = false): Observable<void> {
    this.uid = uid;
    this.ngxAgoraService.AgoraRTC.Logger.setLogLevel(this.ngxAgoraService.AgoraRTC.Logger[debug ? 'DEBUG' : 'NONE']);

    this.client = this.ngxAgoraService.createClient(CLIENT_CONFIG);
    this.assignClientHandlers();

    this.localStream = this.ngxAgoraService.createStream({ ...STREAM_SPEC, streamID: this.uid });

    this.initLocalStream(() => {
      this.streamState.next({ ...this.streamState.value, connected: true, loaderText: 'Waiting others to join' });
      this.join(channel, () => this.publish());
    });

    return this.callEnd.asObservable();
  }

  deinit(): void {
    this.streamState.next(DEFAULT_STREAM_STATE);
  }

  endCall(): void {
    this.client.leave(() => {
      if (this.localStream.isPlaying()) {
        this.localStream.stop();
        this.localStream.close();
      }

      this.streamState.next({ ...this.streamState.value, started: null, loading: true, loaderText: '', ended: true });

      interval(500)
        .pipe(take(1))
        .subscribe(() => this.callEnd.next());
    });
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      enabled ? this.localStream.muteVideo() : this.localStream.unmuteVideo();
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      enabled ? this.localStream.muteAudio() : this.localStream.unmuteAudio();
    }
  }

  toggleFullScreen(enabled: boolean): void {
    enabled ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  }

  isVideoEnabled(): boolean {
    if (this.localStream) {
      return this.localStream.isVideoOn();
    }

    return false;
  }

  isAudioEnabled(): boolean {
    if (this.localStream) {
      return this.localStream.isAudioOn();
    }

    return false;
  }

  private join(channel: string, onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    this.client.join(null, channel, this.uid, onSuccess, onFailure);
  }

  private publish(): void {
    this.client.publish(this.localStream);
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.RemoteStreamSubscribed, (evt) => {
      this.streamState.next({ ...this.streamState.value, started: evt.stream.subscribeLTS, loading: false });
    });

    this.client.on(ClientEvent.Error, error => {
      console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => console.log('Renewed the channel key successfully.'),
          renewError => console.warn('Renew channel key failed: ', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, evt => {
      const stream = evt.stream as Stream;
      this.client.subscribe(stream, { audio: true, video: true }, err => {
        console.log('Subscribe stream failed', err);
      });
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        setTimeout(() => stream.play(id), 1000);
      }
    });

    this.client.on('mute-video' as ClientEvent, () => this.remoteStreamVideoToggle.next(false));

    this.client.on('unmute-video' as ClientEvent, () => this.remoteStreamVideoToggle.next(true));

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, evt => {
      const stream = evt.stream as Stream;

      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call !== `${this.getRemoteId(stream)}`);
        this.endCall();
      }
    });
  }

  private initLocalStream(onSuccess?: () => void): void {
    this.localStream.init(
      () => {
        // The user has granted access to the camera and mic.
        this.localStream.play(this.localContainerId);
        if (onSuccess) {
          onSuccess();
        }
      },
      err => console.warn('getUserMedia failed', err)
    );
  }

  private getRemoteId(stream: Stream): string {
    return `remote_call-${stream.getId()}`;
  }
}
