import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { VideoCallComponent } from '../components';
import { VideoCallDialog, VideoCallDialogData } from '../models';
import { WebRtcComponent } from '../webrtc.component';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class VideoCallDialogService {

  constructor(private dialog: DialogService) { }

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
            debug: !!data.debug,
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
