import { EventEmitter } from '@angular/core';

export interface DialogComponent {
  afterClosed: EventEmitter<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  closeDialog: (data?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}
