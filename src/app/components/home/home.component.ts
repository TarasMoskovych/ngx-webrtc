import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { VideoCallDialog, VideoCallDialogData, VideoCallDialogService } from '@app/ngx-webrtc-lib';
import { filter, tap } from 'rxjs';
import { STORAGE } from '../../app.config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  standalone: true,
})
export class HomeComponent implements OnInit {
  private sessionKey = 'ngx-webrtc:channelId';
  public form: UntypedFormGroup;
  public outcome = false;
  public dialog: VideoCallDialog | null;

  constructor(
    @Inject(STORAGE) private localStorage: Storage,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private videoCallDialogService: VideoCallDialogService,
    private cdr: ChangeDetectorRef,
  ) {
    afterNextRender(() => {
      this.form?.patchValue({ channelId: this.channelId });
    });
  }

  get channelId(): string {
    return this.localStorage.getItem(this.sessionKey) || 'test-channel-ngx-webrtc';
  }

  get tooltipText(): string {
    return this.outcome ? 'Outcome' : 'Income';
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      channelId: ['', Validators.required],
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
