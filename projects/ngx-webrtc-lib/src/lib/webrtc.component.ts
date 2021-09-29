import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { WebRtcService } from './services';

@Component({
  selector: 'ngx-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebRtcComponent implements OnInit {
  @Input() uid: string;
  @Input() channel: string;
  @Input() debug = false;

  public streamStarted$ = this.webRtcService.streamStarted$;
  public remoteStreamVideoToggle$ = this.webRtcService.remoteStreamVideoToggle$;

  constructor(private webRtcService: WebRtcService) { }

  ngOnInit(): void {
    this.webRtcService.init(this.uid, this.channel, this.debug);
  }

  get localContainerId(): string {
    return this.webRtcService.localContainerId;
  }

  get remoteCalls(): string[] {
    return this.webRtcService.remoteCalls;
  }

  get cameraEnabled(): boolean {
    return this.webRtcService.isVideoEnabled();
  }

  get microphoneEnabled(): boolean {
    return this.webRtcService.isAudioEnabled();
  }

  get fullScreenEnabled(): boolean {
    return !!document.fullscreenElement;
  }

  onToggleCamera(state: boolean): void {
    this.webRtcService.toggleVideo(state);
  }

  onToggleMicrophone(state: boolean): void {
    this.webRtcService.toggleAudio(state);
  }

  onToggleFullScreen(state: boolean): void {
    this.webRtcService.toggleFullScreen(state);
  }

  onEndCall(): void {
    console.log('end call');
  }
}
