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
  @Output() toggleCamera = new EventEmitter<boolean>();
  @Output() toggleMicrophone = new EventEmitter<boolean>();
  @Output() toggleFullScreen = new EventEmitter<boolean>();
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

  onEndCall(): void {
    this.endCall.emit();
  }
}
