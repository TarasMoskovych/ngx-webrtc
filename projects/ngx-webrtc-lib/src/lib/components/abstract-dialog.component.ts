import { ChangeDetectorRef, inject } from '@angular/core';
import { Subject } from 'rxjs';

export abstract class DialogComponent {
  protected readonly cdr = inject(ChangeDetectorRef);
  readonly afterClosed = new Subject<any>();
  shown = true;

  closeDialog(data?: any): void {
    this.onAfterClosed(data);
  }

  private onAfterClosed(data?: any): void {
    this.shown = false;
    this.cdr.markForCheck();
    this.afterClosed.next(data);
  }
}
