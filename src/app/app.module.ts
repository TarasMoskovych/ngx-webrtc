import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { WebRtcModule } from 'projects/ngx-webrtc-lib/src/public-api';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { ConferenceComponent, HomeComponent } from './components';
import { ReactiveFormsModule } from '@angular/forms';

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
