import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AgoraConfig } from './models';
import { WebRtcService } from './services';
import { WebRtcComponent } from './webrtc.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    WebRtcComponent,
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
        WebRtcService,
        {
          provide: 'AgoraConfig',
          useValue: config,
        },
      ],
    };
  }
}
