import { Injectable } from '@angular/core';
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

    dialog.afterClosed
      .pipe(take(1))
      .subscribe((data: VideoCallDialogData) => {
        if (data?.channelId) {
          this.dialog.open(WebRtcComponent, { uid: data.uid, channelId: data.channelId });
        }
      });

    return {
      acceptCall: dialog.onAcceptCall.bind(dialog),
      close: dialog.closeDialog.bind(dialog),
    };
  }
}
