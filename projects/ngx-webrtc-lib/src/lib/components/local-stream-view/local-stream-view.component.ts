import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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
  @Output() toggleBlur = new EventEmitter<boolean>();

  onToggleBlur(): void {
    this.toggleBlur.emit(this.blurEnabled);
  }
}
