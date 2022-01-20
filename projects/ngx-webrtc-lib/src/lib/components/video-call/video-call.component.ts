import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, OnInit, OnDestroy } from '@angular/core';
import { DialogComponent } from '../abstract-dialog.component';
import { VideoCallDialogData } from '../../models';
import { fadeAnimation } from '../../animations';

@Component({
  selector: 'ngx-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation],
})
export class VideoCallComponent extends DialogComponent implements OnInit, OnDestroy {
  @Input() data: VideoCallDialogData;
  public fullScreen = false;
  private audio: HTMLAudioElement;

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  ngOnInit(): void {
    this.play(`assets/${this.data.outcome ? 'outcome' : 'income'}.mp3`);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  onAcceptCall(): void {
    this.fullScreen = true;
    this.cdr.markForCheck();
    this.afterClosed.next(this.data);
  }

  onDeclineCall(): void {
    this.play('assets/cancel.mp3');
    setTimeout(() => this.closeDialog(null), 200);
  }

  private play(path: string, loop = true): void {
    if (this.audio) {
      this.stop();
    }

    this.audio = new Audio(path);
    this.audio.loop = loop;
    this.audio.load();
    this.audio.play();
  }

  private stop(): void {
    this.audio.pause();
    this.audio.remove();
  }
}
