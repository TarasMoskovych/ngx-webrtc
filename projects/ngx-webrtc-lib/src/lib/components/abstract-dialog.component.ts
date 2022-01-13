import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

@Component({ template: '' })
export abstract class DialogComponent {
  @Output() afterClosed = new EventEmitter<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  shown = true;

  constructor(protected cdr: ChangeDetectorRef) {}

  closeDialog(data?: any): void { // eslint-disable-line
    this.onAfterClosed(data);
  }

  private onAfterClosed(data?: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any
    this.shown = false;
    this.cdr.markForCheck();
    this.afterClosed.emit(data);
  }
}
