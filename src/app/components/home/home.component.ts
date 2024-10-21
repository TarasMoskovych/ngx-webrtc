import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';

import { VideoCallDialog, VideoCallDialogData, VideoCallDialogService } from 'projects/ngx-webrtc-lib/src/public-api';
// import { VideoCallDialog, VideoCallDialogData, VideoCallDialogService } from 'ngx-webrtc-lib';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private sessionKey = 'ngx-webrtc:channelId';
  public form: UntypedFormGroup;
  public outcome = false;
  public dialog: VideoCallDialog | null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private localStorage: Storage,
    private videoCallDialogService: VideoCallDialogService,
    private cdr: ChangeDetectorRef,
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
    this.dialog = this.videoCallDialogService.open({
      uid: String(Math.floor(Math.random() * 100)),
      channel: this.channelId,
      outcome: this.outcome,
      user: {
        name: 'Test User',
        photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvDtoEwuV9E2kHqNDi6MnBzXlefn8TfyrwgQ&usqp=CAU',
      },
      debug: true,
    });

    const timeout = setTimeout(() => this.dialog?.close(), 7000);

    this.dialog.afterConfirmation().pipe(
      filter((data: VideoCallDialogData) => !!data),
      tap(() => clearTimeout(timeout)),
    ).subscribe();

    this.dialog.afterCallEnd().subscribe(() => {
      clearTimeout(timeout);

      this.dialog = null;
      this.cdr.markForCheck();
    });
  }

  saveChannel(): void {
    const { channelId } = this.form.value;
    this.localStorage.setItem(this.sessionKey, channelId);
  }
}
