import { Component, OnInit, Input } from '@angular/core';
import { WebRtcService } from './services';

@Component({
  selector: 'ngx-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.scss'],
})
export class WebRtcComponent implements OnInit {
  @Input() uid: string;
  @Input() debug = false;

  public cameraEnabled = true;
  public microphoneEnabled = true;
  public fullScreenEnabled = false;
  public streamStarted$ = this.webRtcService.streamStarted$;

  constructor(private webRtcService: WebRtcService) { }

  ngOnInit(): void {
    this.webRtcService.init(this.uid, this.debug);
  }

  get localContainerId(): string {
    return this.webRtcService.localContainerId;
  }

  get remoteCalls(): string[] {
    return this.webRtcService.remoteCalls;
  }

  onToggleCamera(state: boolean): void {
    this.cameraEnabled = state;
  }

  onToggleMicrophone(state: boolean): void {
    this.microphoneEnabled = state;
  }

  onToggleFullScreen(state: boolean): void {
    this.fullScreenEnabled = state;
  }

  onEndCall(): void {
    console.log('end call');
  }
}
