import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../models';

@Component({
  selector: 'ngx-local-stream-view',
  templateUrl: './local-stream-view.component.html',
  styleUrls: ['./local-stream-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocalStreamViewComponent {
  @Input() hidden: boolean;
  @Input() localContainerId: string;
  @Input() microphoneEnabled: boolean;
  @Input() useVirtualBackground: boolean;
  @Input() blurEnabled: boolean;
  @Input() user: User | null;
  @Output() toggleBlur = new EventEmitter<boolean>();

  get userName(): string {
    return this.user?.name || 'Me';
  }

  onToggleBlur(): void {
    this.toggleBlur.emit(this.blurEnabled);
  }
}
