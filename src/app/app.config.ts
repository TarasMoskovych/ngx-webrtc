import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideWebRtc } from '@app/ngx-webrtc-lib';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideWebRtc(environment.configs),
    {
      provide: Storage,
      useValue: window.localStorage,
    },
  ],
};
