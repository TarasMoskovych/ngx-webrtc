import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../models';
import { UserStateComponent } from '../user-state/user-state.component';

@Component({
  selector: 'ngx-local-stream-view',
  standalone: true,
  imports: [UserStateComponent],
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
  @Input() user: User | null;
  @Output() toggleBlur = new EventEmitter<boolean>();

  get userName(): string {
    return this.user?.name || 'Me';
  }

  onToggleBlur(): void {
    this.toggleBlur.emit(this.blurEnabled);
  }
}
