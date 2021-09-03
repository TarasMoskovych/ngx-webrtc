import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ngx-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebRtcComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
