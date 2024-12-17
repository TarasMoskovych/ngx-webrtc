import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-user-state',
  templateUrl: './user-state.component.html',
  styleUrls: ['./user-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserStateComponent {
  @Input() userName: string;
  @Input() muted: boolean;
  @Input() rootClass: string;
}
