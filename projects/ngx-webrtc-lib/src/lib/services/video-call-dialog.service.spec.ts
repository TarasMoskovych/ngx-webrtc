import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { VideoCallComponent } from '../components';
import { VideoCallDialog, VideoCallDialogData } from '../models';
import { DialogService } from './dialog.service';
import { VideoCallDialogService } from './video-call-dialog.service';

describe('VideoCallDialogService', () => {
  let service: VideoCallDialogService;
  let dialogService: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    dialogService = jasmine.createSpyObj('DialogService', ['open']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: DialogService,
          useValue: dialogService,
        },
      ],
    });

    service = TestBed.inject(VideoCallDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    let publicAPI: VideoCallDialog;
    const data: VideoCallDialogData = {
      channel: 'channelId_1234',
      outcome: true,
      uid: 'uid-12345',
      remoteUser: {
        name: 'Test',
        photoURL: 'url',
      },
    };

    describe('accept', () => {
      beforeEach(() => {
        dialogService.open.and.returnValue({
          afterClosed: new BehaviorSubject({ channel: data.channel }),
          onAcceptCall: () => undefined,
          closeDialog: () => undefined,
        } as any);

        publicAPI = service.open(data);
      });

      it('should open "VideoCallComponent" dialog', () => {
        expect(dialogService.open).toHaveBeenCalledWith(VideoCallComponent, { data });
      });

      it('should return public methods for dialog', () => {
        expect(Object.keys(publicAPI).length).toBe(4);
      });

      it('should call "open" twice', () => {
        expect(dialogService.open).toHaveBeenCalledTimes(2);
      });

      it('should be truthy on afterConfirmation', () => {
        publicAPI.afterConfirmation().subscribe((data: VideoCallDialogData) => {
          expect(data).toBeTruthy();
        });
      });

      it('should be truthy on afterCallEnd', () => {
        publicAPI.afterCallEnd().subscribe((data: boolean) => {
          expect(data).toBeTruthy();
        });
      });
    });

    describe('decline', () => {
      beforeEach(() => {
        dialogService.open.and.returnValue({
          afterClosed: new BehaviorSubject(null),
          onAcceptCall: () => undefined,
          closeDialog: () => undefined,
        } as any);

        publicAPI = service.open(data);
      });

      it('should open "VideoCallComponent" dialog', () => {
        expect(dialogService.open).toHaveBeenCalledWith(VideoCallComponent, { data });
      });

      it('should return public methods for dialog', () => {
        expect(Object.keys(publicAPI).length).toBe(4);
      });

      it('should call "open" only once', () => {
        expect(dialogService.open).toHaveBeenCalledTimes(1);
      });

      it('should be null on afterConfirmation', () => {
        publicAPI.afterConfirmation().subscribe((data: VideoCallDialogData) => {
          expect(data).toBeNull();
        });
      });

      it('should be false on afterCallEnd', () => {
        publicAPI.afterCallEnd().subscribe((data: boolean) => {
          expect(data).toBeFalse();
        });
      });
    });
  });
});
