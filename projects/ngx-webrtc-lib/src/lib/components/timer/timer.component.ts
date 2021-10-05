import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ngx-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent implements OnInit {
  @Input() started: number = Date.now();
  public time$: Observable<string>;

  ngOnInit(): void {
    this.time$ = timer(0, 1000).pipe(
      map(() => this.format(Date.now() - this.started)),
    );
  }

  format(duration: number): string {
    const s = Math.floor((duration / 1000) % 60).toString().padStart(2, '0');
    const m = Math.floor((duration / (1000 * 60)) % 60).toString().padStart(2, '0');
    const h = Math.floor((duration / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');

    return [h, m, s].join(':');
  }
}
