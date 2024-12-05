import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AgoraConfig } from './models';
import { WebRtcService } from './services';
import { WebRtcComponent } from './webrtc.component';

/**
 * The WebRTC module for Angular applications.
 * This module provides the WebRTC functionality through `WebRtcComponent` and its associated services.
 *
 * The `forRoot` method configures the WebRTC services and provides the necessary Agora SDK configuration.
 * This should be used once in the root module of your application to initialize WebRTC.
 *
 * @publicApi
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    WebRtcComponent,
  ],
  exports: [
    WebRtcComponent,
  ],
})
export class WebRtcModule {

  /**
   * Configures the WebRTC module with the Agora SDK configuration.
   * This method must be called in the root module of your Angular application to properly initialize WebRTC services.
   *
   * @param config The configuration object for Agora SDK, including the AppID and other related settings.
   * @returns A `ModuleWithProviders` object that configures the WebRTC module and services.
   */
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
