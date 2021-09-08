import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebRtcModule } from 'projects/ngx-webrtc-lib/src/public-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    WebRtcModule.forRoot({ AppID: '' }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
