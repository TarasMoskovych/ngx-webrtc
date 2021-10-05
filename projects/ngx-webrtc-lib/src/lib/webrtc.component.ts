import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { take } from 'rxjs/operators';
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
  @Output() callEnd = new EventEmitter<void>();

  public streamState$ = this.webRtcService.streamState$;
  public remoteStreamVideoToggle$ = this.webRtcService.remoteStreamVideoToggle$;

  constructor(private webRtcService: WebRtcService) { }

  ngOnInit(): void {
    this.webRtcService.init(this.uid, this.channel, this.debug)
      .pipe(take(1))
      .subscribe(() => this.callEnd.emit());
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
    this.webRtcService.endCall();
  }
}
