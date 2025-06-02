import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ControlsComponent {
  @Input() cameraEnabled = true;
  @Input() microphoneEnabled = true;
  @Input() fullScreenEnabled = false;
  @Input() smallScreenEnabled = false;
  @Input() transcriptEnabled = false;
  @Input() displaySmallScreen = false;
  @Input() displayTranscript = false;
  @Output() toggleCamera = new EventEmitter<boolean>();
  @Output() toggleMicrophone = new EventEmitter<boolean>();
  @Output() toggleFullScreen = new EventEmitter<boolean>();
  @Output() toggleSmallScreen = new EventEmitter<boolean>();
  @Output() toggleTranscript = new EventEmitter<boolean>();
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

  onToggleTranscript(): void {
    this.toggleTranscript.emit(!this.transcriptEnabled);
  }

  onEndCall(): void {
    this.endCall.emit();
  }
}
