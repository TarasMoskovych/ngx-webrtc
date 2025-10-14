import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AgoraConfig } from './models';
import { AGORA_CONFIG, WebRtcService } from './services';

/**
 * Provides WebRTC-related services and configuration for use in Angular applications.
 * This function sets up the necessary providers for WebRTC services and configures
 * the Agora SDK using the provided configuration.
 *
 * @param config The configuration object for Agora SDK, which includes details such as AppID and other settings.
 * @returns An `EnvironmentProviders` object that configures the `WebRtcService` and Agora configuration for the application.
 * @publicApi
 */
export function provideWebRtc(config: AgoraConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    WebRtcService,
    {
      provide: AGORA_CONFIG,
      useValue: config,
    },
  ]);
}
