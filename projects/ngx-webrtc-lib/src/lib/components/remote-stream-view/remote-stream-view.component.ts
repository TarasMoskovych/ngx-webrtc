import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from '../../models';
import { UserStateComponent } from '../user-state/user-state.component';

@Component({
  selector: 'ngx-remote-stream-view',
  standalone: true,
  imports: [NgClass, UserStateComponent],
  templateUrl: './remote-stream-view.component.html',
  styleUrl: './remote-stream-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteStreamViewComponent {
  @Input({ required: true }) id: string;
  @Input({ required: true }) cameraEnabled: boolean;
  @Input({ required: true }) microphoneEnabled: boolean;
  @Input() user: User | null;
  @Input() controlsVisible: boolean | null;
  @Input() rootClass: object;
}
