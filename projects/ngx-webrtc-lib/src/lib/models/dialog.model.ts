import { Subject } from 'rxjs';

export interface DialogComponent {
  afterClosed: Subject<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  closeDialog: (data?: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}
