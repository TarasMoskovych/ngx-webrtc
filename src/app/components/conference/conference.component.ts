import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, WebRtcComponent } from '@app/ngx-webrtc-lib';

export const LOCAL_USER: User = {
  name: 'Me',
  photoURL: 'assets/local-user.png',
};

export const REMOTE_USER: User = {
  name: 'Remote',
  photoURL: 'assets/remote-user.png',
};

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WebRtcComponent],
  standalone: true,
})
export class ConferenceComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  channel: string;
  uid = String(Math.floor(Math.random() * 100));
  remoteUser = REMOTE_USER;
  localUser = LOCAL_USER;

  ngOnInit(): void {
    this.channel = this.route.snapshot.queryParams['channelId'] || 'test-channel';
  }

  onCallEnd(): void {
    this.router.navigateByUrl('/');
  }
}
