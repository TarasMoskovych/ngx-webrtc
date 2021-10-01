import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  channel = 'test-channel-ngx-webrtc';
  uid = String(Math.floor(Math.random() * 100));

  onCallEnd(): void {
    console.log('call end');
  }
}
