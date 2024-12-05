import { fakeAsync, tick } from '@angular/core/testing';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { DEFAULT_STREAM_STATE, StreamState } from '../models';
import { WebRtcService } from './web-rtc.service';

const AppID = 'app-id_12345';
const channel = 'test-channel';
const uid = 'user_54321';

describe('WebRtcService', () => {
  const clientSpy: jasmine.SpyObj<IAgoraRTCClient> = jasmine.createSpyObj('AgoraRTCClient', [], {
    join: () => Promise.resolve(),
    publish: () => Promise.resolve(),
    leave: () => Promise.resolve(),
    subscribe: jasmine.createSpy().and.resolveTo({ play: () => undefined }),
    on(eventName: string, cb: (user: IAgoraRTCRemoteUser, data?: any) => void) {
      if (eventName === 'user-info-updated') {
        const msg = service.remoteCalls.includes('1234') ? 'mute-video' : 'unmute-video';
        return cb({ uid: '1234' } as IAgoraRTCRemoteUser, msg);
      }

      cb({ uid } as IAgoraRTCRemoteUser);
    },
  });

  const virtualBackgroundProcessor = jasmine.createSpyObj('VirtualBackgroundProcessor', [
    'init',
    'enable',
    'disable',
    'setOptions',
  ], {
    enabled: true,
  });

  const virtualBackgroundExtenstion = jasmine.createSpyObj('VirtualBackgroundExtension', [], {
    createProcessor: () => virtualBackgroundProcessor,
  });

  const mockStreamTracks = () => {
    return {
      audioTrack: jasmine.createSpyObj('IMicrophoneAudioTrack', ['setMuted', 'stop', 'close'], { muted: false }),
      videoTrack: jasmine.createSpyObj('ICameraVideoTrack', ['setMuted', 'stop', 'close'], { muted: false }),
    };
  };

  let service: WebRtcService;

  beforeEach(() => {
    service = new WebRtcService({ AppID, useVirtualBackground: true });
    service['agoraRTC'] = AgoraRTC;
  });

  describe('browser supports WebRTC', () => {
    beforeEach(() => {
      spyOn(AgoraRTC, 'checkSystemRequirements').and.returnValue(true);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('init', () => {
      beforeEach(() => {
        spyOn<any>(AgoraRTC, 'setLogLevel');
        spyOn<any>(AgoraRTC, 'createClient').and.returnValue(clientSpy);
        spyOn<any>(AgoraRTC, 'createCameraVideoTrack').and.returnValue(Promise.resolve({ play: jasmine.createSpy() }));
        spyOn<any>(AgoraRTC, 'createMicrophoneAudioTrack').and.returnValue(Promise.resolve({ play: jasmine.createSpy() }));
        spyOn<any>(service, 'assignClientHandlers');
        spyOn<any>(service, 'loadSDK').and.resolveTo();
      });

      describe('debug', () => {
        it('should start without debug', fakeAsync(() => {
          service['config'].debug = false;
          service.init(uid, channel, null).subscribe();
          tick();

          expect(AgoraRTC.setLogLevel).toHaveBeenCalledOnceWith(4);
        }));

        it('should start with debug', fakeAsync(() => {
          service['config'].debug = true;
          service.init(uid, channel, null).subscribe();
          tick();

          expect(AgoraRTC.setLogLevel).toHaveBeenCalledOnceWith(0);
        }));
      });

      describe('agora init', () => {
        it('should call "createClient" method with configs and token', fakeAsync(() => {
          const token = 'token_12345';
          service.init(uid, channel, token).subscribe();
          tick();

          expect(AgoraRTC.createClient).toHaveBeenCalledOnceWith({
            mode: 'rtc',
            codec: 'h264',
          });
        }));

        it('should be connected to stream after "initLocalStream"', fakeAsync(() => {
          service.init(uid, channel, null).subscribe();
          tick(500);

          service.streamState$.subscribe((state: StreamState) => {
            expect(state).toEqual({
              connected: true,
              loading: true,
              statusText: 'Waiting others to join',
              started: null,
              ended: false,
              error: false,
            });
          });
        }));
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
      let audioTrackSpy: jasmine.SpyObj<IMicrophoneAudioTrack>;
      let videoTrackSpy: jasmine.SpyObj<ICameraVideoTrack>;

      beforeEach(() => {
        const { audioTrack, videoTrack } = mockStreamTracks();
        audioTrackSpy = audioTrack;
        videoTrackSpy = videoTrack;

        service['localTracks'] = { videoTrack, audioTrack };
        service['client'] = clientSpy;
      });

      it('should call stop stream methods', fakeAsync(() => {
        service.endCall();
        tick(500);

        expect(audioTrackSpy.close).toHaveBeenCalled();
        expect(videoTrackSpy.close).toHaveBeenCalled();
      }));

      it('should change the state to end status', fakeAsync(() => {
        service.endCall();
        tick(500);

        service.streamState$.subscribe((state: StreamState) => {
          expect(state).toEqual({
            connected: false,
            started: null,
            loading: true,
            statusText: '',
            ended: true,
            error: false,
          });
        });
      }));

      it('should emit "callEnd" event after 500 seconds', fakeAsync(() => {
        spyOn<any>(service['callEnd'], 'next');
        service.endCall();
        tick(500);

        expect(service['callEnd'].next).toHaveBeenCalledTimes(1);
      }));
    });

    describe('toggleVideo', () => {
      let audioTrackSpy: jasmine.SpyObj<IMicrophoneAudioTrack>;
      let videoTrackSpy: jasmine.SpyObj<ICameraVideoTrack>;

      beforeEach(() => {
        const { audioTrack, videoTrack } = mockStreamTracks();
        audioTrackSpy = audioTrack;
        videoTrackSpy = videoTrack;
      });

      describe('local stream created', () => {
        beforeEach(() => {
          service['localTracks'] = { videoTrack: videoTrackSpy, audioTrack: audioTrackSpy };
        });

        it('should call "setMuted" method with true if video is enabled', () => {
          service.toggleVideo(true);
          expect(videoTrackSpy.setMuted).toHaveBeenCalledWith(true);
        });

        it('should call "setMuted" method with false if video is disabled', () => {
          service.toggleVideo(false);
          expect(videoTrackSpy.setMuted).toHaveBeenCalledWith(false);
        });
      });

      describe('local stream is not created', () => {
        it('should skip methods execution', () => {
          service.toggleVideo(false);
          expect(videoTrackSpy.setMuted).not.toHaveBeenCalled();
        });
      });
    });

    describe('toggleAudio', () => {
      let audioTrackSpy: jasmine.SpyObj<IMicrophoneAudioTrack>;
      let videoTrackSpy: jasmine.SpyObj<ICameraVideoTrack>;

      beforeEach(() => {
        const { audioTrack, videoTrack } = mockStreamTracks();
        audioTrackSpy = audioTrack;
        videoTrackSpy = videoTrack;
      });

      describe('local stream created', () => {
        beforeEach(() => {
          service['localTracks'] = { audioTrack: audioTrackSpy, videoTrack: videoTrackSpy };
        });

        it('should call "setMuted" method with true if audio is enabled', () => {
          service.toggleAudio(true);
          expect(audioTrackSpy.setMuted).toHaveBeenCalledWith(true);
        });

        it('should call "setMuted" method with false if audio is disabled', () => {
          service.toggleAudio(false);
          expect(audioTrackSpy.setMuted).toHaveBeenCalledWith(false);
        });
      });

      describe('local stream is not created', () => {
        it('should skip methods execution', () => {
          service.toggleAudio(false);
          expect(audioTrackSpy.setMuted).not.toHaveBeenCalled();
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

    describe('toggleBlur', () => {
      beforeEach(() => {
        service['virtualBackgroundProcessor'] = jasmine.createSpyObj('VirtualBackgroundProcessor', ['enable', 'disable']);
      });

      it('should call "enable" method when blur is disabled', () => {
        service.toggleBlur(false);
        expect(service['virtualBackgroundProcessor'].enable).toHaveBeenCalled();
      });

      it('should call "disable" method when blur is enabled', () => {
        service.toggleBlur(true);
        expect(service['virtualBackgroundProcessor'].disable).toHaveBeenCalled();
      });
    });

    describe('isVideoEnabled', () => {
      let audioTrackSpy: jasmine.SpyObj<IMicrophoneAudioTrack>;
      let videoTrackSpy: jasmine.SpyObj<ICameraVideoTrack>;

      beforeEach(() => {
        const { audioTrack, videoTrack } = mockStreamTracks();
        audioTrackSpy = audioTrack;
        videoTrackSpy = videoTrack;
      });

      describe('local stream created', () => {
        beforeEach(() => {
          service['localTracks'] = { audioTrack: audioTrackSpy, videoTrack: videoTrackSpy };
        });

        it('should return true', () => {
          expect(service.isVideoEnabled()).toBeTrue();
        });
      });

      describe('local stream is not created', () => {
        it('should return false', () => {
          expect(service.isVideoEnabled()).toBeFalse();
        });
      });
    });

    describe('isAudioEnabled', () => {
      let audioTrackSpy: jasmine.SpyObj<IMicrophoneAudioTrack>;
      let videoTrackSpy: jasmine.SpyObj<ICameraVideoTrack>;

      beforeEach(() => {
        const { audioTrack, videoTrack } = mockStreamTracks();
        audioTrackSpy = audioTrack;
        videoTrackSpy = videoTrack;
      });

      describe('local stream created', () => {
        beforeEach(() => {
          service['localTracks'] = { audioTrack: audioTrackSpy, videoTrack: videoTrackSpy };
        });

        it('should return true', () => {
          expect(service.isAudioEnabled()).toBeTrue();
        });
      });

      describe('local stream is not created', () => {
        it('should return false', () => {
          expect(service.isAudioEnabled()).toBeFalse();
        });
      });
    });

    describe('isBlurEnabled', () => {
      it('should return true when blur is enabled', () => {
        service['virtualBackgroundProcessor'] = jasmine.createSpyObj('VirtualBackgroundProcessor', [], { enabled: true });
        expect(service.isBlurEnabled()).toBeTrue();
      });
    });

    describe('useVirtualBackground', () => {
      it('should return true when virtual background is enabled', () => {
        service['config'].useVirtualBackground = true;
        expect(service.useVirtualBackground()).toBeTrue();
      });

      it('should return false when virtual background is disabled', () => {
        service['config'].useVirtualBackground = false;
        expect(service.useVirtualBackground()).toBeFalse();
      });
    });

    describe('assignClientHandlers', () => {
      beforeEach(() => {
        spyOn(service, 'endCall');
        service['client'] = clientSpy;
      });

      it('should call "subscribe" method when new user publishes the stream', () => {
        service['assignClientHandlers']();
        expect(clientSpy.subscribe).toHaveBeenCalled();
      });

      it('should set remoteStreamVideoToggle to true when remote published a video', () => {
        service['assignClientHandlers']();

        service.remoteStreamVideoToggle$.subscribe((state: boolean) => {
          expect(state).toBeTrue();
        });
      });

      it('should set remoteStreamVideoToggle to false when remote hides a video', () => {
        service.remoteCalls.push('1234');
        service['assignClientHandlers']();

        service.remoteStreamVideoToggle$.subscribe((state: boolean) => {
          expect(state).toBeFalse();
        });
      });

      it('should call "endCall" method when client is disconnected', () => {
        service['assignClientHandlers']();
        expect(service.endCall).toHaveBeenCalled();
      });
    });

    describe('initLocalStream', () => {
      it('should create local stream', fakeAsync(() => {
        const { audioTrack, videoTrack } = mockStreamTracks();

        spyOn(AgoraRTC, 'createCameraVideoTrack').and.resolveTo(videoTrack);
        spyOn(AgoraRTC, 'createMicrophoneAudioTrack').and.resolveTo(audioTrack);

        service['initLocalStream']().then(() => {
          tick();
          expect(service['localTracks']).toEqual({ audioTrack, videoTrack });
        });
      }));

      it('should handle an error', fakeAsync(() => {
        const { audioTrack } = mockStreamTracks();
        const errorMsg = 'Cannot create video stream';

        spyOn(AgoraRTC, 'createCameraVideoTrack').and.rejectWith(new Error(errorMsg));
        spyOn(AgoraRTC, 'createMicrophoneAudioTrack').and.resolveTo(audioTrack);

        service['initLocalStream']().catch(() => {
          tick(5000);
          service.streamState$.subscribe((state: StreamState) => {
            expect(state).toEqual({
              connected: false,
              loading: true,
              statusText: errorMsg,
              started: null,
              ended: false,
              error: true,
            });
          });
        });
      }));
    });

    describe('loadSDK', () => {
      it('should load all SDKs', fakeAsync(() => {
        const webRtcService = new WebRtcService({ AppID, useVirtualBackground: true });
        webRtcService['loadSDK']();

        tick();

        expect(webRtcService['agoraRTC']).toBeDefined();
        expect(webRtcService['virtualBackgroundExtension']).toBeDefined();
      }));

      it('should load only Agora SDK', fakeAsync(() => {
        const webRtcService = new WebRtcService({ AppID });
        webRtcService['loadSDK']();

        tick();

        expect(webRtcService['agoraRTC']).toBeDefined();
        expect(webRtcService['virtualBackgroundExtension']).toBeUndefined();
      }));
    });

    describe('initVirtualBackgroundProcessor', () => {
      it('should initialize virtual background processor', async () => {
        service['localTracks'] = mockStreamTracks();
        service['localTracks'].videoTrack.pipe = jasmine.createSpy().and.returnValue({ pipe: () => undefined });
        service['virtualBackgroundExtension'] = virtualBackgroundExtenstion;

        await service['initVirtualBackgroundProcessor']();

        expect(virtualBackgroundProcessor.setOptions).toHaveBeenCalledWith({
          blurDegree: 2,
          type: 'blur',
        });
      });
    });
  });

  describe('browser does not support WebRTC', () => {
    it('should handle an error', (done: DoneFn) => {
      spyOn(AgoraRTC, 'checkSystemRequirements').and.returnValue(false);

      service['loadSDK']().catch((err: Error) => {
        expect(err.message).toBe('Web RTC is not supported in this browser');
        done();
      });
    });
  });
});
