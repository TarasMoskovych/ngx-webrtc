import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  ControlsComponent,
  SpinnerComponent,
  TimerComponent,
  VideoCallComponent,
} from './components';
import { WebRtcComponent } from './webrtc.component';

import {
  ToggleDirective,
} from './directives';

import { AgoraConfig } from './models';
import { DialogService, VideoCallDialogService, WebRtcService } from './services';

@NgModule({
  declarations: [
    ControlsComponent,
    WebRtcComponent,
    TimerComponent,
    SpinnerComponent,
    ToggleDirective,
    VideoCallComponent,
  ],
  imports: [
    CommonModule,
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
        DialogService,
        VideoCallDialogService,
        WebRtcService,
        {
          provide: 'AgoraConfig',
          useValue: config,
        },
      ],
    };
  }
}
