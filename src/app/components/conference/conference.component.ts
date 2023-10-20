import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-conference',
  templateUrl: './conference.component.html',
  styleUrls: ['./conference.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConferenceComponent implements OnInit {
  channel: string;
  uid = String(Math.floor(Math.random() * 100));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.channel = this.route.snapshot.queryParams['channelId'] || 'test-channel';
  }

  onCallEnd(): void {
    this.router.navigateByUrl('/');
  }
}
