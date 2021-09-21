import { Injectable } from '@angular/core';
import { AgoraClient, ClientConfig, ClientEvent, NgxAgoraService, Stream, StreamSpec } from 'ngx-agora';

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

  localContainerId = 'local-video';
  remoteCalls: string[] = [];

  constructor(private ngxAgoraService: NgxAgoraService) { }

  init(uid: string, debug = false): void {
    if (!uid) {
      throw new Error(`uid must be specified`);
    }

    this.uid = uid;
    this.ngxAgoraService.AgoraRTC.Logger.setLogLevel(this.ngxAgoraService.AgoraRTC.Logger[debug ? 'DEBUG' : 'NONE']);

    this.client = this.ngxAgoraService.createClient(CLIENT_CONFIG);
    this.assignClientHandlers();

    this.localStream = this.ngxAgoraService.createStream({ ...STREAM_SPEC, streamID: this.uid });
    this.initLocalStream(() => this.join('channel_default', () => this.publish(), error => console.error(error)));
  }

  call(channel  = 'channel_default'): void {
    this.initLocalStream(() => this.join(channel, () => this.publish()));
  }

  endCall(): Promise<void> {
    return new Promise(resolve => {
      this.client.leave(() => {
        if (this.localStream.isPlaying()) {
          this.localStream.stop();
          this.localStream.close();
        }
        resolve();
      });
    });
  }

  mute(enabled: boolean): void {
    enabled ? this.localStream.muteAudio() : this.localStream.unmuteAudio();
  }

  isVideoAllowed(): boolean {
    return this.ngxAgoraService.videoDevices.length > 0;
  }

  isAudioAllowed(): boolean {
    return this.ngxAgoraService.audioDevices.length > 0;
  }

  private join(channel: string, onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    this.client.join(null, channel, this.uid, onSuccess, onFailure);
  }

  private publish(): void {
    this.client.publish(this.localStream);
  }

  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, () => {
      console.log('Publish local stream successfully');
    });

    this.client.on(ClientEvent.Error, error => {
      console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => console.log('Renewed the channel key successfully.'),
          renewError => console.error('Renew channel key failed: ', renewError)
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
        console.log(`${evt.uid} left from this channel`);
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
      err => console.error('getUserMedia failed', err)
    );
  }

  private getRemoteId(stream: Stream): string {
    return `remote_call-${stream.getId()}`;
  }
}
