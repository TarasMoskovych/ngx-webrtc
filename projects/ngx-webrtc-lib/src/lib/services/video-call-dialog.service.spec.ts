import { of } from 'rxjs';

import { DialogService } from './dialog.service';
import { VideoCallDialogService } from './video-call-dialog.service';
import { VideoCallDialog, VideoCallDialogData } from '../models';
import { VideoCallComponent } from '../components';

describe('VideoCallDialogService', () => {
  let service: VideoCallDialogService;
  let dialogService: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    dialogService = jasmine.createSpyObj('DialogService', ['open']);
    service = new VideoCallDialogService(dialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    let publicAPI: VideoCallDialog;
    const data: VideoCallDialogData = {
      channelId: 'channelId_1234',
      outcome: true,
      uid: 'uid-12345',
      user: {
        name: 'Test',
        photoURL: 'url',
      },
    };

    describe('accept', () => {
      beforeEach(() => {
        dialogService.open.and.returnValue({
          afterClosed: of({ channelId: data.channelId }),
          onAcceptCall: () => undefined,
          closeDialog: () => undefined,
        } as VideoCallComponent);

        publicAPI = service.open(data);
      });

      it('should open "VideoCallComponent" dialog', () => {
        expect(dialogService.open).toHaveBeenCalledWith(VideoCallComponent, { data });
      });

      it('should return public methods for dialog', () => {
        expect(Object.keys(publicAPI).length).toBe(2);
      });

      it('should call "open" twice', () => {
        expect(dialogService.open).toHaveBeenCalledTimes(2);
      });
    });

    describe('decline', () => {
      beforeEach(() => {
        dialogService.open.and.returnValue({
          afterClosed: of({}),
          onAcceptCall: () => undefined,
          closeDialog: () => undefined,
        } as VideoCallComponent);

        publicAPI = service.open(data);
      });

      it('should open "VideoCallComponent" dialog', () => {
        expect(dialogService.open).toHaveBeenCalledWith(VideoCallComponent, { data });
      });

      it('should return public methods for dialog', () => {
        expect(Object.keys(publicAPI).length).toBe(2);
      });

      it('should call "open" only once', () => {
        expect(dialogService.open).toHaveBeenCalledTimes(1);
      });
    });
  });
});
