import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WebRtcService } from 'src/app/ngx-webrtc.export';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private sessionKey = 'ngx-webrtc:channelId';
  public form: FormGroup;
  public outcome = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private localStorage: Storage,
    private webRtcService: WebRtcService,
  ) { }

  get channelId(): string {
    return this.localStorage.getItem(this.sessionKey) || 'test-channel-ngx-webrtc';
  }

  get tooltipText(): string {
    return this.outcome ? 'Outcome' : 'Income';
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      channelId: [this.channelId, Validators.required],
    });
  }

  onSubmit(): void {
    this.saveChannel();
    this.router.navigate(['conference'], { queryParams: { ...this.form.value } });
  }

  onModalOpen(): void {
    this.saveChannel();
    const dialog = this.webRtcService.openDialog({
      uid: '1234567',
      channelId: this.channelId,
      outcome: this.outcome,
      user: {
        name: 'Test User',
        photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvDtoEwuV9E2kHqNDi6MnBzXlefn8TfyrwgQ&usqp=CAU',
      },
    });

    setTimeout(() => dialog.close(), 7000);
  }

  saveChannel(): void {
    const { channelId } = this.form.value;
    this.localStorage.setItem(this.sessionKey, channelId);
  }
}
