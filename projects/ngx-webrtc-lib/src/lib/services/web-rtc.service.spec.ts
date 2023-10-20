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

  const mockStreamTracks = () => {
    return {
      audioTrack: jasmine.createSpyObj('IMicrophoneAudioTrack', ['setMuted', 'stop', 'close'], { muted: false }),
      videoTrack: jasmine.createSpyObj('ICameraVideoTrack', ['setMuted', 'stop', 'close'], { muted: false }),
    };
  };

  let service: WebRtcService;

  describe('browser supports WebRTC', () => {
    beforeEach(() => {
      spyOn(AgoraRTC, 'checkSystemRequirements').and.returnValue(true);
      service = new WebRtcService({ AppID });
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
      });

      describe('debug', () => {
        it('should start without debug', () => {
          service.init(uid, channel);
          expect(AgoraRTC.setLogLevel).toHaveBeenCalledOnceWith(4);
        });

        it('should start with debug', () => {
          service.init(uid, channel, true);
          expect(AgoraRTC.setLogLevel).toHaveBeenCalledOnceWith(0);
        });
      });

      describe('agora init', () => {
        it('should call "createClient" method with configs', () => {
          service.init(uid, channel);

          expect(AgoraRTC.createClient).toHaveBeenCalledOnceWith({
            mode: 'rtc',
            codec: 'h264',
          });
        });

        it('should be connected to stream after "initLocalStream"', fakeAsync(() => {
          service.init(uid, channel);
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
      it('should create local stream', () => {
        const { audioTrack, videoTrack } = mockStreamTracks();

        spyOn(AgoraRTC, 'createCameraVideoTrack').and.resolveTo(videoTrack);
        spyOn(AgoraRTC, 'createMicrophoneAudioTrack').and.resolveTo(audioTrack);

        service['initLocalStream']().then(() => {
          expect(service['localTracks']).toEqual({ audioTrack, videoTrack });
        });
      });

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
  });

  describe('browser does not support WebRTC', () => {
    it('should handle an error', () => {
      spyOn(AgoraRTC, 'checkSystemRequirements').and.returnValue(false);
      expect(() => new WebRtcService({ AppID })).toThrow(new Error('Web RTC is not supported in this browser'));
    });
  });
});
