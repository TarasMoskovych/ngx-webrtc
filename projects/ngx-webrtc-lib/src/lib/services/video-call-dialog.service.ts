import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

import { VideoCallDialogData, VideoCallDialog } from '../models';
import { DialogService } from './dialog.service';
import { WebRtcComponent } from '../webrtc.component';
import { VideoCallComponent } from '../components';

@Injectable({
  providedIn: 'root'
})
export class VideoCallDialogService {

  constructor(private dialog: DialogService) { }

  open(data: VideoCallDialogData): VideoCallDialog {
    const dialog = this.dialog.open(VideoCallComponent, { data }) as VideoCallComponent;
    let webRtcDialog: WebRtcComponent;

    dialog.afterClosed
      .pipe(take(1))
      .subscribe((data: VideoCallDialogData) => {
        if (data?.channel) {
          webRtcDialog = this.dialog.open(WebRtcComponent, {
            uid: data.uid,
            channel: data.channel,
            debug: !!data.debug,
            displaySmallScreen: true,
          }) as WebRtcComponent;
        }
      });

    return {
      acceptCall: dialog.onAcceptCall.bind(dialog),
      close: dialog.closeDialog.bind(dialog),
      afterConfirmation: () => dialog.afterClosed.asObservable().pipe(take(1)),
      afterCallEnd: () => {
        return webRtcDialog ? webRtcDialog.afterClosed.asObservable().pipe(take(1)) : of(false);
      },
    };
  }
}
