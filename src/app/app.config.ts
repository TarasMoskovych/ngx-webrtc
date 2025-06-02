import { isPlatformBrowser } from '@angular/common';
import { ApplicationConfig, inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideWebRtc } from '@app/ngx-webrtc-lib';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const STORAGE = new InjectionToken<Storage>('Storage');

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideClientHydration(),
    provideWebRtc({
      ...environment.configs,
      debug: true,
      useVirtualBackground: true,
      useTranscription: true,
    }),
    {
      provide: STORAGE,
      useFactory: () => {
        const platformId = inject(PLATFORM_ID);
        return isPlatformBrowser(platformId) ? window.localStorage : null;
      }
    },
  ],
};
