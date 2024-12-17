import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { fadeAnimation } from '../../animations';
import { VideoCallDialogData } from '../../models';
import { DialogComponent } from '../abstract-dialog.component';

@Component({
  selector: 'ngx-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation],
  imports: [NgIf],
  standalone: true,
})
export class VideoCallComponent extends DialogComponent implements OnInit, OnDestroy {
  @Input() data: VideoCallDialogData;
  public fullScreen = false;
  private audio: HTMLAudioElement;

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  get remoteUserName(): string {
    return this.data.remoteUser.name;
  }

  get remoteUserPhotoURL(): string {
    return this.data.remoteUser.photoURL;
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
