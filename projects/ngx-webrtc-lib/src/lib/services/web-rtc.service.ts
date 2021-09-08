import { Injectable } from '@angular/core';
import { NgxAgoraService } from 'ngx-agora';

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {

  constructor(private agoraService: NgxAgoraService) {
    this.agoraService.createClient({
      mode: 'rtc',
      codec: 'h264',
    });
  }
}
