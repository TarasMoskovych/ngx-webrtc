import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebRtcModule } from 'projects/ngx-webrtc-lib/src/public-api';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    WebRtcModule.forRoot(environment.configs),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
