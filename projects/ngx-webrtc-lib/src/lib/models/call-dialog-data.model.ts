import { Observable } from 'rxjs';

export interface VideoCallDialogData {
  uid: string;
  channel: string;
  outcome: boolean;
  user: User;
  token?: string;
  debug?: boolean;
}

export interface VideoCallDialog {
  acceptCall: () => void,
  close: () => void,
  afterConfirmation: () => Observable<VideoCallDialogData>;
  afterCallEnd: () => Observable<boolean>;
}

interface User {
  name: string;
  photoURL: string;
}
