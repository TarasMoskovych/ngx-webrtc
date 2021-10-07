import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { WebRtcModule } from 'projects/ngx-webrtc-lib/src/public-api';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { ConferenceComponent, HomeComponent } from './components';

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
    WebRtcModule.forRoot(environment.configs),
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
