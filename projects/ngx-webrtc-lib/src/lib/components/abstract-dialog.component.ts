import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';

export abstract class DialogComponent {
  afterClosed = new Subject<any>();
  shown = true;

  constructor(protected cdr: ChangeDetectorRef) {}

  closeDialog(data?: any): void {
    this.onAfterClosed(data);
  }

  private onAfterClosed(data?: any): void {
    this.shown = false;
    this.cdr.markForCheck();
    this.afterClosed.next(data);
  }
}
