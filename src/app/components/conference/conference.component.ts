import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'projects/ngx-webrtc-lib/src/public-api';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConferenceComponent implements OnInit {
  channel: string;
  uid = String(Math.floor(Math.random() * 100));
  remoteUser = REMOTE_USER;
  localUser = LOCAL_USER;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.channel = this.route.snapshot.queryParams.channelId || 'test-channel';
  }

  onCallEnd(): void {
    this.router.navigateByUrl('/');
  }
}
