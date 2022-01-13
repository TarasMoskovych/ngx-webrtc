export interface CallDialogData {
  uid: string;
  channelId: string;
  outcome: boolean;
  user: User;
}

interface User {
  name: string;
  photoURL: string;
}
