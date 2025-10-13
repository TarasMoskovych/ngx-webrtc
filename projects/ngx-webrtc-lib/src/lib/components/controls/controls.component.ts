import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ngx-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent {
  @Input() cameraEnabled = true;
  @Input() microphoneEnabled = true;
  @Input() fullScreenEnabled = false;
  @Input() smallScreenEnabled = false;
  @Input() screenShareEnabled = false;
  @Input() displaySmallScreen = false;
  @Output() toggleCamera = new EventEmitter<boolean>();
  @Output() toggleMicrophone = new EventEmitter<boolean>();
  @Output() toggleFullScreen = new EventEmitter<boolean>();
  @Output() toggleSmallScreen = new EventEmitter<boolean>();
  @Output() toggleScreenShare = new EventEmitter<boolean>();
  @Output() endCall = new EventEmitter<void>();

  onToggleCamera(): void {
    this.toggleCamera.emit(this.cameraEnabled);
  }

  onToggleMicrophone(): void {
    this.toggleMicrophone.emit(this.microphoneEnabled);
  }

  onToggleFullScreen(): void {
    this.toggleFullScreen.emit(this.fullScreenEnabled);
  }

  onToggleSmallScreen(): void {
    this.toggleSmallScreen.emit(this.smallScreenEnabled);
  }

  onToggleScreenShare(): void {
    this.toggleScreenShare.emit(this.screenShareEnabled);
  }

  onEndCall(): void {
    this.endCall.emit();
  }
}
