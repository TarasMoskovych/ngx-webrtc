import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IAgoraRTC, IAgoraRTCClient, ICameraVideoTrack, ILocalVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { filter, firstValueFrom, take } from 'rxjs';
import { DEFAULT_STREAM_STATE, StreamState } from '../models';
import { AGORA_CONFIG, ClientEvents, UserInfoUpdatedMessages, WebRtcService } from './web-rtc.service';

const AppID = 'app-id_12345';
const channel = 'test-channel';
const uid = 'user_54321';
const waitForInit = async (service: WebRtcService) => {
  await firstValueFrom(
    service.streamState$.pipe(
      filter(s => s.connected === true),
      take(1)
    ),
  );
};

class MockAgoraRTCClient implements Partial<IAgoraRTC> {
  createClient = jasmine.createSpy();
  checkSystemRequirements = jasmine.createSpy();
  setLogLevel = jasmine.createSpy();
  createCameraVideoTrack = jasmine.createSpy();
  createMicrophoneAudioTrack = jasmine.createSpy();
  createScreenVideoTrack = jasmine.createSpy();
  registerExtensions = jasmine.createSpy();
}

describe('WebRtcService', () => {
  let agoraRTC: jasmine.SpyObj<IAgoraRTC>;
  const eventHandlers: Record<string, (...args: any[]) => void> = {};
  const clientSpy: jasmine.SpyObj<IAgoraRTCClient> = jasmine.createSpyObj('AgoraRTCClient', [], {
    join: () => Promise.resolve(),
    publish: () => Promise.resolve(),
    unpublish: () => Promise.resolve(),
    leave: () => Promise.resolve(),
    subscribe: jasmine.createSpy().and.resolveTo({ play: () => undefined }),
    on: jasmine.createSpy().and.callFake((eventName: string, cb: (...args: any[]) => void) => {
      eventHandlers[eventName] = cb;
    }),
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
      audioTrack: jasmine.createSpyObj('IMicrophoneAudioTrack', ['setMuted', 'stop', 'close', 'play'], { muted: false }),
      videoTrack: jasmine.createSpyObj('ICameraVideoTrack', ['setMuted', 'stop', 'close', 'play'], { muted: false }),
      screenTrack: jasmine.createSpyObj('ILocalVideoTrack', ['setMuted', 'stop', 'close', 'play']),
    };
  };

  let service: WebRtcService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: AGORA_CONFIG,
          useValue: {
            AppID,
            useVirtualBackground: true,
          },
        },
        WebRtcService,
      ],
    });
    service = TestBed.inject(WebRtcService);
    service['agoraRTC'] = new MockAgoraRTCClient() as unknown as IAgoraRTC;
    agoraRTC = service['agoraRTC'] as jasmine.SpyObj<IAgoraRTC>;
  });

  describe('browser supports WebRTC', () => {
    beforeEach(() => {
      agoraRTC.checkSystemRequirements.and.returnValue(true);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('init', () => {
      beforeEach(() => {
        agoraRTC.createClient.and.returnValue(clientSpy);
        agoraRTC.createCameraVideoTrack.and.returnValue(Promise.resolve({ play: jasmine.createSpy() } as unknown as ICameraVideoTrack));
        agoraRTC.createMicrophoneAudioTrack.and.returnValue(Promise.resolve({ play: jasmine.createSpy() } as unknown as IMicrophoneAudioTrack));
        spyOn<any>(service, 'assignClientHandlers');
        spyOn<any>(service, 'loadSDK').and.resolveTo();
      });

      describe('debug', () => {
        it('should start without debug', async () => {
          service['config'].debug = false;
          service.init(uid, channel, null).subscribe();
          await waitForInit(service);

          expect(agoraRTC.setLogLevel).toHaveBeenCalledOnceWith(4);
        });

        it('should start with debug', async () => {
          service['config'].debug = true;
          service.init(uid, channel, null).subscribe();
          await waitForInit(service);

          expect(agoraRTC.setLogLevel).toHaveBeenCalledOnceWith(0);
        });
      });

      describe('agora init', () => {
        it('should call "createClient" method with configs and token', async () => {
          const token = 'token_12345';
          service.init(uid, channel, token).subscribe();
          await waitForInit(service);

          expect(agoraRTC.createClient).toHaveBeenCalledOnceWith({
            mode: 'rtc',
            codec: 'h264',
          });
        });

        it('should be connected to stream after "initLocalStream"', async () => {
          service.init(uid, channel, null).subscribe();
          await waitForInit(service);

          service.streamState$.subscribe((state: StreamState) => {
            expect(state).toEqual({
              connected: true,
              loading: true,
              statusText: 'Waiting remote to join',
              started: null,
              ended: false,
              error: false,
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
      let audioTrackSpy: jasmine.SpyObj<IMicrophoneAudioTrack>;
      let videoTrackSpy: jasmine.SpyObj<ICameraVideoTrack>;

      beforeEach(() => {
        const { audioTrack, videoTrack } = mockStreamTracks();
        audioTrackSpy = audioTrack;
        videoTrackSpy = videoTrack;

        service['localTracks'] = { videoTrack, audioTrack };
        service['client'] = clientSpy;
      });

      it('should call stop stream methods', async () => {
        service.endCall();
        await Promise.resolve();

        expect(audioTrackSpy.close).toHaveBeenCalled();
        expect(videoTrackSpy.close).toHaveBeenCalled();
      });

      it('should change the state to end status', async () => {
        service.endCall();
        await Promise.resolve();

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
      });

      it('should emit callEnd', async () => {
        const callEndSpy = spyOn(service['callEnd'], 'next');

        service.endCall();

        await Promise.resolve();
        await new Promise(res => setTimeout(res, 600));

        expect(callEndSpy).toHaveBeenCalled();
      });
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

    describe('toggleScreenShare', () => {
      let screenTrackSpy: jasmine.SpyObj<ILocalVideoTrack>;
      let stopSpy: jasmine.Spy;

      beforeEach(() => {
        const { audioTrack, videoTrack, screenTrack } = mockStreamTracks();
        screenTrackSpy = screenTrack;

        service['localTracks'] = { videoTrack, audioTrack };
        service['client'] = clientSpy;
        stopSpy = jasmine.createSpy('stop');

        agoraRTC.createCameraVideoTrack.and.resolveTo(videoTrack);
        agoraRTC.createMicrophoneAudioTrack.and.resolveTo(audioTrack);
        agoraRTC.createScreenVideoTrack.and.returnValue(Promise.resolve({
          stop: stopSpy,
          play: jasmine.createSpy(),
          close: jasmine.createSpy(),
          on: jasmine.createSpy().and.callFake((eventName: string, cb: (...args: any[]) => void) => {
            eventHandlers[eventName] = cb;
          }),
        } as unknown as ILocalVideoTrack));
      });

      it('should start screen sharing', async () => {
        await service.toggleScreenShare(false);

        eventHandlers['track-ended']();

        expect(agoraRTC.createScreenVideoTrack).toHaveBeenCalled();
        expect(service['localTracks'].screenTrack).toBeDefined();
        expect(service.isScreenShared()).toBeTrue();
      });

      it('should stop screen sharing', async () => {
        service['localTracks'].screenTrack = screenTrackSpy;
        await service.toggleScreenShare(true);
        service['localTracks'].screenTrack = undefined;

        expect(service.isScreenShared()).toBeFalse();
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
        service['assignClientHandlers']();
      });

      it('should update stream state and save remote when he joins the call', () => {
        eventHandlers[ClientEvents.UserJoined]?.({ uid });

        service.streamState$.subscribe(({ started }: StreamState) => {
          expect(started).toBeDefined();
        });

        expect(service['remoteCalls']).toEqual([`remote_call-${uid}`]);
      });

      it('should play remote stream when it is published', () => {
        service['remoteCalls'] = [`remote_call-${uid}`];
        eventHandlers[ClientEvents.UserPublished]?.({ uid }, 'video');

        expect(clientSpy.subscribe).toHaveBeenCalled();
      });

      it('should set remoteStreamVideoToggle to false when remote hides a video', () => {
        eventHandlers[ClientEvents.UserInfoUpdated]?.(uid, UserInfoUpdatedMessages.MuteVideo);

        service.remoteStreamVideoToggle$.subscribe((state: boolean) => {
          expect(state).toBeFalse();
        });
      });

      it('should set remoteStreamVideoToggle to true when remote enables a video', () => {
        eventHandlers[ClientEvents.UserInfoUpdated]?.(uid, UserInfoUpdatedMessages.UnmuteVideo);

        service.remoteStreamVideoToggle$.subscribe((state: boolean) => {
          expect(state).toBeTrue();
        });
      });

      it('should set remoteStreamAudioToggle to false when remote mutes an audio', () => {
        eventHandlers[ClientEvents.UserInfoUpdated]?.(uid, UserInfoUpdatedMessages.MuteAudio);

        service.remoteStreamAudioToggle$.subscribe((state: boolean) => {
          expect(state).toBeFalse();
        });
      });

      it('should set remoteStreamAudioToggle to true when remote enables an audio', () => {
        eventHandlers[ClientEvents.UserInfoUpdated]?.(uid, UserInfoUpdatedMessages.UnmuteAudio);

        service.remoteStreamAudioToggle$.subscribe((state: boolean) => {
          expect(state).toBeTrue();
        });
      });

      it('should call "endCall" method when client is disconnected', () => {
        eventHandlers[ClientEvents.UserLeft]?.();
        expect(service.endCall).toHaveBeenCalled();
      });
    });

    describe('initLocalStream', () => {
      it('should create local stream', async () => {
        const { audioTrack, videoTrack } = mockStreamTracks();

        agoraRTC.createCameraVideoTrack.and.resolveTo(videoTrack);
        agoraRTC.createMicrophoneAudioTrack.and.resolveTo(audioTrack);

        await service['initLocalStream']();
        expect(service['localTracks']).toEqual({ audioTrack, videoTrack, screenTrack: undefined });
      });

      it('should handle an error', async () => {
        const { audioTrack } = mockStreamTracks();
        const errorMsg = 'Cannot create video stream';

        agoraRTC.createCameraVideoTrack.and.rejectWith(new Error(errorMsg));
        agoraRTC.createMicrophoneAudioTrack.and.resolveTo(audioTrack);

        service['initLocalStream']().catch(() => {
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
      });
    });

    describe('loadSDK', () => {
      it('should load all SDKs', async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            {
              provide: AGORA_CONFIG,
              useValue: {
                AppID,
                useVirtualBackground: true,
              },
            },
            WebRtcService,
          ],
        });
        const webRtcService = TestBed.inject(WebRtcService);
        await webRtcService['loadSDK']();

        expect(webRtcService['agoraRTC']).toBeDefined();
        expect(webRtcService['virtualBackgroundExtension']).toBeDefined();
      });

      it('should load only Agora SDK', async () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [
            {
              provide: AGORA_CONFIG,
              useValue: { AppID },
            },
            WebRtcService,
          ],
        });
        const webRtcService = TestBed.inject(WebRtcService);
        await webRtcService['loadSDK']();

        expect(webRtcService['agoraRTC']).toBeDefined();
        expect(webRtcService['virtualBackgroundExtension']).toBeUndefined();
      });
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
      agoraRTC.checkSystemRequirements.and.returnValue(false);

      service['loadSDK']().catch((err: Error) => {
        expect(err.message).toBe('Web RTC is not supported in this browser');
        done();
      });
    });
  });
});
