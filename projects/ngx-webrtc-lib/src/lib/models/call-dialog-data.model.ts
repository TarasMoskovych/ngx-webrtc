export interface VideoCallDialogData {
  uid: string;
  channelId: string;
  outcome: boolean;
  user: User;
}

export interface VideoCallDialog {
  acceptCall: () => void,
  close: () => void,
}

interface User {
  name: string;
  photoURL: string;
}
