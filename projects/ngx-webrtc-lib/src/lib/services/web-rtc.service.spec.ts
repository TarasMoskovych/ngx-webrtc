import { fakeAsync, tick } from '@angular/core/testing';
import { AgoraClient, NgxAgoraService, Stream } from 'ngx-agora';
import { of } from 'rxjs';

import { VideoCallComponent } from '../components';
import { DEFAULT_STREAM_STATE, StreamState, VideoCallDialog, VideoCallDialogData } from '../models';
import { DialogService } from './dialog.service';
import { WebRtcService } from './web-rtc.service';

describe('WebRtcService', () => {
  let service: WebRtcService;
  let agoraService: jasmine.SpyObj<NgxAgoraService>;
  let dialogService: jasmine.SpyObj<DialogService>;

  beforeEach(() => {
    agoraService = jasmine.createSpyObj('NgxAgoraService', ['createClient', 'createStream'], {
      AgoraRTC: {
        Logger: {
          DEBUG: 'debug',
          NONE: 'none',
          setLogLevel: jasmine.createSpy(),
        },
      },
      config: {
        AppId: '12345',
      },
    });
    dialogService = jasmine.createSpyObj('DialogService', ['open']);
    service = new WebRtcService(agoraService, dialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openDialog', () => {
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

        publicAPI = service.openDialog(data);
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

        publicAPI = service.openDialog(data);
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

  describe('init', () => {
    beforeEach(() => {
      spyOn<any>(service, 'assignClientHandlers');
      spyOn<any>(service, 'publish');
      spyOn<any>(service, 'initLocalStream').and.callFake((cb: () => void) => cb());
      spyOn<any>(service, 'join').and.callFake((channel: string, cb: () => void) => cb());
    });

    describe('debug', () => {
      it('should start without debug', () => {
        service.init('1234', 'test_channel');
        expect(agoraService.AgoraRTC.Logger.setLogLevel).toHaveBeenCalledOnceWith(agoraService.AgoraRTC.Logger.NONE);
      });

      it('should start with debug', () => {
        service.init('1234', 'test_channel', true);
        expect(agoraService.AgoraRTC.Logger.setLogLevel).toHaveBeenCalledOnceWith(agoraService.AgoraRTC.Logger.DEBUG);
      });
    });

    describe('agora init', () => {
      beforeEach(() => {
        service.init('1234', 'test_channel');
      });

      it('should call "createClient" method with configs', () => {
        expect(agoraService.createClient).toHaveBeenCalledOnceWith({
          mode: 'rtc',
          codec: 'h264',
        });
      });

      it('should call "createStream" method with configs', () => {
        expect(agoraService.createStream).toHaveBeenCalledOnceWith({
          audio: true,
          video: true,
          screen: false,
          streamID: '1234',
        });
      });

      it('should be connected to stream after "initLocalStream"', () => {
        service.streamState$.subscribe((state: StreamState) => {
          expect(state).toEqual({
            connected: true,
            loading: true,
            statusText: 'Waiting others to join',
            started: null,
            ended: false,
          });
        });
      });
    });
  });

  describe('deinit', () => {
    it('should change the state to default', () => {
      service.deinit();

      service.streamState$.subscribe((state: StreamState) => {
        expect(state).toEqual(DEFAULT_STREAM_STATE);
      });
    });
  });

  describe('endCall', () => {
    const clientSpy = {
      leave: (cb: () => void) => cb(),
    } as AgoraClient;

    beforeEach(() => {
      spyOn<any>(service, 'assignClientHandlers');
      spyOn<any>(service, 'publish');
      spyOn<any>(service, 'initLocalStream');
      spyOn<any>(service, 'join');

      agoraService.createClient.and.returnValue(clientSpy);
    });

    it('should call stop stream methods when it is active', () => {
      const localStreamSpy = {
        isPlaying: () => true,
        stop: jasmine.createSpy(),
        close: jasmine.createSpy(),
      } as any;

      agoraService.createStream.and.returnValue(localStreamSpy);

      service.init('1234', 'test');
      service.endCall();

      expect(localStreamSpy.stop).toHaveBeenCalledTimes(1);
      expect(localStreamSpy.close).toHaveBeenCalledTimes(1);
    });

    it('should not call stop stream methods when it is not active', () => {
      const localStreamSpy = {
        isPlaying: () => false,
        stop: jasmine.createSpy(),
        close: jasmine.createSpy(),
      } as any;

      agoraService.createStream.and.returnValue(localStreamSpy);

      service.init('1234', 'test');
      service.endCall();

      expect(localStreamSpy.stop).not.toHaveBeenCalledTimes(1);
      expect(localStreamSpy.close).not.toHaveBeenCalledTimes(1);
    });

    it('should change the state to end status', () => {
      const localStreamSpy = {
        isPlaying: () => false,
        stop: jasmine.createSpy(),
        close: jasmine.createSpy(),
      } as any;

      agoraService.createStream.and.returnValue(localStreamSpy);

      service.init('1234', 'test');
      service.endCall();

      service.streamState$.subscribe((state: StreamState) => {
        expect(state).toEqual({
          connected: false,
          started: null,
          loading: true,
          statusText: '',
          ended: true,
        });
      });
    });

    it('should emit "callEnd" event after 500 seconds', fakeAsync(() => {
      const localStreamSpy = {
        isPlaying: () => false,
        stop: jasmine.createSpy(),
        close: jasmine.createSpy(),
      } as any;

      agoraService.createStream.and.returnValue(localStreamSpy);

      service.init('1234', 'test').subscribe(() => expect(true).toBeTrue());
      service.endCall();

      tick(500);
    }));
  });

  describe('toggleVideo', () => {
    beforeEach(() => {
      spyOn<any>(service, 'assignClientHandlers');
      spyOn<any>(service, 'publish');
      spyOn<any>(service, 'initLocalStream');
      spyOn<any>(service, 'join');
    });

    describe('local stream created', () => {
      let localStreamSpy: any;

      beforeEach(() => {
        localStreamSpy = {
          muteVideo: jasmine.createSpy(),
          unmuteVideo: jasmine.createSpy(),
        };

        agoraService.createStream.and.returnValue(localStreamSpy);
        service.init('1234', 'test');
      });

      it('should call "muteVideo" method if video is enabled', () => {
        service.toggleVideo(true);
        expect(localStreamSpy.muteVideo).toHaveBeenCalledTimes(1);
      });

      it('should call "unMuteVideo" method if video is disabled', () => {
        service.toggleVideo(false);
        expect(localStreamSpy.unmuteVideo).toHaveBeenCalledTimes(1);
      });
    });

    describe('local stream is not created', () => {
      let localStreamSpy: any;

      beforeEach(() => {
        localStreamSpy = {
          muteVideo: jasmine.createSpy(),
          unmuteVideo: jasmine.createSpy(),
        };

        agoraService.createStream.and.returnValue(null as any);
        service.init('1234', 'test');
      });

      it('should skip methods execution', () => {
        service.toggleVideo(false);

        expect(localStreamSpy.unmuteVideo).not.toHaveBeenCalled();
        expect(localStreamSpy.muteVideo).not.toHaveBeenCalled();
      });
    });
  });

  describe('toggleAudio', () => {
    beforeEach(() => {
      spyOn<any>(service, 'assignClientHandlers');
      spyOn<any>(service, 'publish');
      spyOn<any>(service, 'initLocalStream');
      spyOn<any>(service, 'join');
    });

    describe('local stream created', () => {
      let localStreamSpy: any;

      beforeEach(() => {
        localStreamSpy = {
          muteAudio: jasmine.createSpy(),
          unmuteAudio: jasmine.createSpy(),
        };

        agoraService.createStream.and.returnValue(localStreamSpy);
        service.init('1234', 'test');
      });

      it('should call "muteAudio" method if video is enabled', () => {
        service.toggleAudio(true);
        expect(localStreamSpy.muteAudio).toHaveBeenCalledTimes(1);
      });

      it('should call "unMuteAudio" method if video is disabled', () => {
        service.toggleAudio(false);
        expect(localStreamSpy.unmuteAudio).toHaveBeenCalledTimes(1);
      });
    });

    describe('local stream is not created', () => {
      let localStreamSpy: any;

      beforeEach(() => {
        localStreamSpy = {
          muteAudio: jasmine.createSpy(),
          unmuteAudio: jasmine.createSpy(),
        };

        agoraService.createStream.and.returnValue(null as any);
        service.init('1234', 'test');
      });

      it('should skip methods execution', () => {
        service.toggleAudio(false);

        expect(localStreamSpy.unmuteAudio).not.toHaveBeenCalled();
        expect(localStreamSpy.muteAudio).not.toHaveBeenCalled();
      });
    });
  });

  describe('toggleFullScreen', () => {
    beforeEach(() => {
      spyOn(document.documentElement, 'requestFullscreen');
      spyOn(document, 'exitFullscreen');
    });

    it('should call "requestFullscreen" when full screen is not enabled', () => {
      service.toggleFullScreen(false);
      expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
    });

    it('should call "exitFullscreen" when full screen is enabled', () => {
      service.toggleFullScreen(true);
      expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
    });
  });

  describe('isVideoEnabled', () => {
    beforeEach(() => {
      spyOn<any>(service, 'assignClientHandlers');
      spyOn<any>(service, 'publish');
      spyOn<any>(service, 'initLocalStream');
      spyOn<any>(service, 'join');
    });

    describe('local stream created', () => {
      let localStreamSpy: any;

      beforeEach(() => {
        localStreamSpy = {
          isVideoOn: jasmine.createSpy(),
        };

        agoraService.createStream.and.returnValue(localStreamSpy);
        service.init('1234', 'test');
      });

      it('should call "isVideoOn" method', () => {
        service.isVideoEnabled();
        expect(localStreamSpy.isVideoOn).toHaveBeenCalledTimes(1);
      });
    });

    describe('local stream is not created', () => {
      let localStreamSpy: any;

      beforeEach(() => {
        localStreamSpy = {
          isVideoOn: jasmine.createSpy(),
        };

        agoraService.createStream.and.returnValue(null as any);
        service.init('1234', 'test');
      });

      it('should skip method execution', () => {
        expect(service.isVideoEnabled()).toBeFalse();
        expect(localStreamSpy.isVideoOn).not.toHaveBeenCalled();
      });
    });
  });

  describe('isAudioEnabled', () => {
    beforeEach(() => {
      spyOn<any>(service, 'assignClientHandlers');
      spyOn<any>(service, 'publish');
      spyOn<any>(service, 'initLocalStream');
      spyOn<any>(service, 'join');
    });

    describe('local stream created', () => {
      let localStreamSpy: any;

      beforeEach(() => {
        localStreamSpy = {
          isAudioOn: jasmine.createSpy(),
        };

        agoraService.createStream.and.returnValue(localStreamSpy);
        service.init('1234', 'test');
      });

      it('should call "isAudioOn" method', () => {
        service.isAudioEnabled();
        expect(localStreamSpy.isAudioOn).toHaveBeenCalledTimes(1);
      });
    });

    describe('local stream is not created', () => {
      let localStreamSpy: any;

      beforeEach(() => {
        localStreamSpy = {
          isAudioOn: jasmine.createSpy(),
        };

        agoraService.createStream.and.returnValue(null as any);
        service.init('1234', 'test');
      });

      it('should skip method execution', () => {
        expect(service.isAudioEnabled()).toBeFalse();
        expect(localStreamSpy.isAudioOn).not.toHaveBeenCalled();
      });
    });
  });

  describe('join', () => {
    const clientSpy = {
      join: jasmine.createSpy(),
    } as any;

    const localStream = {
      init: (cb: () => void, cb2: () => void) => {
        cb();
        cb2();
      },
      play: jasmine.createSpy(),
    } as any;

    beforeEach(() => {
      spyOn<any>(service, 'assignClientHandlers');
      spyOn<any>(service, 'publish').and.returnValue(() => undefined);

      agoraService.createClient.and.returnValue(clientSpy);
      agoraService.createStream.and.returnValue(localStream);
      service.init('1234', 'test');
    });

    it('should call "join" method', () => {
      expect(clientSpy.join).toHaveBeenCalledOnceWith(
        null,
        'test',
        '1234',
        jasmine.any(Function),
        undefined,
      );
    });
  });

  describe('publish', () => {
    const clientSpy = {
      publish: jasmine.createSpy(),
    } as any;

    beforeEach(() => {
      spyOn<any>(service, 'assignClientHandlers');
      spyOn<any>(service, 'initLocalStream').and.callFake((cb: () => void) => cb());
      spyOn<any>(service, 'join').and.callFake((channel: string, cb: () => void) => cb());

      agoraService.createClient.and.returnValue(clientSpy);
      service.init('1234', 'test');
    });

    it('should call "publish" method', () => {
      expect(clientSpy.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe('assignClientHandlers', () => {
    const clientSpy = {
      subscribeLTS: 12345,
      getId: () => 'test_id',
      play: jasmine.createSpy(),
      stop: jasmine.createSpy(),
      subscribe: jasmine.createSpy().and.callFake((stream: Stream, configs: any, cb: () => void) => cb()),
      renewChannelKey: jasmine.createSpy().and.callFake((key: string, cb: () => void, cb2) => {
        cb();
        cb2();
      }),
      on: (eventName: string, cb: any) => {
        if (eventName === 'peer-leave') {
          service.remoteCalls = ['test_id', '2'];
        } else {
          service.remoteCalls = [];
        }

        if (eventName === 'error') {
          return cb({ reason: 'DYNAMIC_KEY_TIMEOUT' });
        }

        return cb({ stream: clientSpy });
      }
    } as any;

    beforeEach(() => {
      spyOn<any>(service, 'publish');
      spyOn<any>(service, 'initLocalStream').and.callFake((cb: () => void) => cb());
      spyOn<any>(service, 'join').and.callFake((channel: string, cb: () => void) => cb());
      spyOn<any>(window, 'setTimeout').and.callFake((cb: () => void) => cb());
      spyOn(service, 'endCall');

      agoraService.createClient.and.returnValue(clientSpy);
      service.init('1234', 'test_channel');
    });

    it('should change the state when "RemoteStreamSubscribed" event occurs', () => {
      service.streamState$.subscribe((state: StreamState) => {
        expect(state).toEqual({
          connected: true,
          statusText: 'Waiting others to join',
          ended: false,
          started: 12345,
          loading: false,
        });
      });
    });

    it('should call "renewChannelKey" method when reason is DYNAMIC_KEY_TIMEOUT', () => {
      expect(clientSpy.renewChannelKey).toHaveBeenCalled();
    });

    it('should call "subscribe" method when new stream is added', () => {
      expect(clientSpy.subscribe).toHaveBeenCalled();
    });

    it('should call "play" method after 1 second', () => {
      expect(clientSpy.play).toHaveBeenCalled();
    });

    it('should call "stop" method when stream is removed', () => {
      expect(clientSpy.stop).toHaveBeenCalled();
    });

    it('should call "endCall" method when client is disconnected', () => {
      expect(service.endCall).toHaveBeenCalled();
    });
  });
});
