import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass],
})
export class SpinnerComponent {
  @Input() text: string;
  @Input() error = false;
  @Input() connected = true;
  @Input() ended = false;
  @Input() small = false;

  get color(): string {
    if (this.ended) {
      return '#aaa';
    }

    if (this.error) {
      return '#d73b3d';
    }

    return this.connected ? '#37D425' : '#1195E6';
  }
}
