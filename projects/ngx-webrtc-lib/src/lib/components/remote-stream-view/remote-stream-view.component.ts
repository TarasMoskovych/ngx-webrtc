import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from '../../models';

@Component({
  selector: 'ngx-remote-stream-view',
  templateUrl: './remote-stream-view.component.html',
  styleUrls: ['./remote-stream-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteStreamViewComponent {
  @Input() id: string;
  @Input() cameraEnabled: boolean;
  @Input() microphoneEnabled: boolean;
  @Input() user: User | null;
  @Input() rootClass: Record<string, unknown>;
}
