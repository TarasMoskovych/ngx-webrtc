import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxAgoraModule, AgoraConfig, NgxAgoraService } from 'ngx-agora';
import { WebRtcComponent } from './webrtc.component';

@NgModule({
  declarations: [
    WebRtcComponent,
  ],
  imports: [
    CommonModule,
    NgxAgoraModule,
  ],
  exports: [
    WebRtcComponent,
  ],
})
export class WebRtcModule {
  static forRoot(config: AgoraConfig): ModuleWithProviders<WebRtcModule> {
    return {
      ngModule: WebRtcModule,
      providers: [
        NgxAgoraService, {
          provide: 'config',
          useValue: config,
        },
      ],
    };
  }
}
