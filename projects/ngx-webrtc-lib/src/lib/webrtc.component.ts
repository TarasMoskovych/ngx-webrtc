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
}
