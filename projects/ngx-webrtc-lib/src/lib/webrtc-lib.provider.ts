import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AgoraConfig } from './models';
import { WebRtcService } from './services';

export function provideWebRtc(config: AgoraConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    WebRtcService,
    {
      provide: 'AgoraConfig',
      useValue: config,
    },
  ]);
}
