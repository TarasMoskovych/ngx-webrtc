import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { VideoCallComponent } from '../components';
import { VideoCallDialog, VideoCallDialogData } from '../models';
import { WebRtcComponent } from '../webrtc.component';
import { DialogService } from './dialog.service';

/**
 * Service for managing the video call dialog and its interactions.
 * Provides methods to open a video call dialog and handle call flow.
 * @publicApi
 */
@Injectable({
  providedIn: 'root',
})
export class VideoCallDialogService {

  constructor(private dialog: DialogService) { }

  /**
   * Opens the video call dialog with the given data.
   * Manages the flow of the video call including confirming the call and launching WebRTC for video.
   *
   * @param data The data to initialize the video call dialog (includes user info, channel, etc.).
   * @returns An object with methods to control the dialog and get call status.
   */
  open(data: VideoCallDialogData): VideoCallDialog {
    const callEnded = new Subject<boolean>();
    const dialog = this.dialog.open(VideoCallComponent, { data }) as VideoCallComponent;

    dialog.afterClosed.asObservable().pipe(
      switchMap((data: VideoCallDialogData) => {
        if (data?.channel) {
          return this.dialog.open(WebRtcComponent, {
            uid: data.uid,
            token: data.token,
            channel: data.channel,
            localUser: data.localUser,
            remoteUser: data.remoteUser,
            displaySmallScreen: true,
          }).afterClosed.asObservable();
        }

        return of(false);
      }),
      take(1),
      tap(() => callEnded.next(true)),
    ).subscribe();

    return {
      acceptCall: dialog.onAcceptCall.bind(dialog),
      close: dialog.closeDialog.bind(dialog),
      afterConfirmation: () => dialog.afterClosed.asObservable().pipe(take(1)),
      afterCallEnd: () => callEnded.asObservable().pipe(take(1)),
    };
  }
}
