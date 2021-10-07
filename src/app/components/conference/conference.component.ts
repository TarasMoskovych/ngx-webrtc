import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConferenceComponent {
  channel = 'test-channel-ngx-webrtc';
  uid = String(Math.floor(Math.random() * 100));

  constructor(private router: Router) {}

  onCallEnd(): void {
    this.router.navigateByUrl('/');
  }
}
