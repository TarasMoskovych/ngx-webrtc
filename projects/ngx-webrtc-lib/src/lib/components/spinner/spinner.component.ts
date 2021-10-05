import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'ngx-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent {
  @Input() text: string;
  @Input() connected = true;
  @Input() ended = false;

  get color(): string {
    if (this.ended) {
      return '#aaa';
    }

    return this.connected ? '#39D627' : '#1296E7';
  }
}
