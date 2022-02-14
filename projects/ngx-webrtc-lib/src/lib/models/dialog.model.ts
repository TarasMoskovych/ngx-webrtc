import { Subject } from 'rxjs';

export interface DialogComponent {
  afterClosed: Subject<any>;
  closeDialog: (data?: any) => void;
}
