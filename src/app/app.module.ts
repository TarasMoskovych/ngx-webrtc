import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { ConferenceComponent, HomeComponent } from './components';

// import { WebRtcModule } from 'projects/ngx-webrtc-lib/src/public-api';
import { WebRtcModule } from 'ngx-webrtc-lib';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'conference',
    component: ConferenceComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  declarations: [
    AppComponent,
    ConferenceComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    WebRtcModule.forRoot(environment.configs),
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  providers: [
    {
      provide: Storage,
      useValue: window.localStorage,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
