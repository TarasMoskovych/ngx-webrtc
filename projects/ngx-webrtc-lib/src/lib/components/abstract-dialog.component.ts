import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

export abstract class DialogComponent {
  afterClosed = new Subject<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  shown = true;

  constructor(protected cdr: ChangeDetectorRef) {}

  closeDialog(data?: any): void { // eslint-disable-line
    this.onAfterClosed(data);
  }

  private onAfterClosed(data?: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.shown = false;
    this.cdr.markForCheck();
    this.afterClosed.next(data);
  }
}
