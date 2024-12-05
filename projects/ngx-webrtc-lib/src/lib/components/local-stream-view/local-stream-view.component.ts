import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-local-stream-view',
  standalone: true,
  imports: [],
  templateUrl: './local-stream-view.component.html',
  styleUrl: './local-stream-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalStreamViewComponent {
  @Input({ required: true }) hidden: boolean;
  @Input({ required: true }) localContainerId: string;
  @Input({ required: true }) microphoneEnabled: boolean;
  @Input({ required: true }) useVirtualBackground: boolean;
  @Input({ required: true }) blurEnabled: boolean;
  @Output() toggleBlur = new EventEmitter<boolean>();

  onToggleBlur(): void {
    this.toggleBlur.emit(this.blurEnabled);
  }
}
