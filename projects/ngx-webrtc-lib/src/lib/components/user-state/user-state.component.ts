import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-user-state',
  standalone: true,
  imports: [NgClass],
  templateUrl: './user-state.component.html',
  styleUrl: './user-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserStateComponent {
  @Input({ required: true }) userName: string;
  @Input({ required: true }) muted: boolean;
  @Input() rootClass: string;
}
