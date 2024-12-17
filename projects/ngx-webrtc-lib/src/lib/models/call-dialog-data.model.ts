import { Observable } from 'rxjs';

/**
 * Data structure used for initializing a video call dialog.
 * @publicApi
 */
export interface VideoCallDialogData {
  /**
   * User identifier.
   */
  uid: string;

  /**
   * Channel identifier.
   */
  channel: string;

  /**
   * Determines the call mode.
   * Set to `true` for outgoing calls and `false` for incoming calls.
   */
  outcome: boolean;

  /**
   * Represents the remote user in the call.
   * It replaces the `user` field and should be used instead.
   */
  remoteUser: User;

  /**
   * Represents the current user in the call.
   * Optional, used for reference or display purposes.
   */
  localUser?: User;

  /**
   * Agora token used for [Secure Authentication](https://docs.agora.io/en/video-calling/get-started/authentication-workflow).
   * Optional. Defaults to `null`.
   */
  token?: string;
}

/**
 * Interface for the video call dialog.
 * @publicApi
 */
export interface VideoCallDialog {
  /**
   * Closes the confirmation dialog and opens the `WebRtcComponent`
   * with the passed data from the dialog.
   */
  acceptCall: () => void;

  /**
   * Closes the dialog containing the video-call confirmation component.
   */
  close: () => void;

  /**
   * Returns an `Observable` with the data depending on whether the call was accepted or declined.
   * If the call is accepted, the data will be provided; otherwise, it may be `null`.
   */
  afterConfirmation: () => Observable<VideoCallDialogData>;

  /**
   * Returns an `Observable` that emits a value when the call ends.
   * Emits `true` if the call ended successfully or `false` if there was an issue.
   */
  afterCallEnd: () => Observable<boolean>;
}

/**
 * Represents a user with basic profile information.
 * @publicApi
 */
export interface User {
  /**
   * The name of the user.
   */
  name: string;

  /**
   * The URL of the user's profile photo.
   */
  photoURL: string;
}
