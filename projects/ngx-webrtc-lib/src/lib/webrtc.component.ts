import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { WebRtcService } from './services';

@Component({
  selector: 'ngx-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebRtcComponent implements OnInit {

  constructor(private webRtcService: WebRtcService) { }

  ngOnInit(): void {
  }

}
