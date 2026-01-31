import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

import { DEFAULT_STREAM_STATE } from './models';
import { WebRtcService } from './services';
import { WebRtcComponent } from './webrtc.component';

describe('WebRtcComponent', () => {
  let component: WebRtcComponent;
  let fixture: ComponentFixture<WebRtcComponent>;
  const cdr = {
    markForCheck: vi.fn(),
  };
  let webRtcService: Mocked<WebRtcService>;

  beforeEach(async () => {
    webRtcService = {
      init: vi.fn(),
      deinit: vi.fn(),
      isVideoEnabled: vi.fn(),
      isAudioEnabled: vi.fn(),
      isBlurEnabled: vi.fn(),
      isScreenShared: vi.fn(),
      toggleVideo: vi.fn(),
      toggleAudio: vi.fn(),
      toggleFullScreen: vi.fn(),
      toggleBlur: vi.fn(),
      toggleScreenShare: vi.fn(),
      useVirtualBackground: vi.fn(),
      endCall: vi.fn(),
      streamState$: of(DEFAULT_STREAM_STATE),
      remoteStreamVideoToggle$: of(false),
      localContainerId: 'local',
      remoteCalls: ['1', '2', '3'],
    } as unknown as Mocked<WebRtcService>;

    await TestBed.configureTestingModule({
      imports: [WebRtcComponent],
      providers: [
        {
          provide: PLATFORM_ID,
          useValue: 'browser',
        },
        {
          provide: ChangeDetectorRef,
          useValue: cdr,
        },
        {
          provide: WebRtcService,
          useValue: webRtcService,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WebRtcComponent);
    component = fixture.componentInstance;
    component.uid = '1234';
    component.channel = 'test_channel';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInitWebRtc', () => {
    beforeEach(() => {
      vi.spyOn(component.callEnd, 'emit');
      vi.spyOn(component, 'closeDialog');
      webRtcService.init.mockReturnValue(of(undefined));
      component.onInitWebRtc();
    });

    it('should call "init" method with parameters', () => {
      expect(webRtcService.init).toHaveBeenCalledTimes(1);
      expect(webRtcService.init).toHaveBeenCalledWith(component.uid, component.channel, component.token);
    });

    it('should emit "callEnd" event after end state', () => {
      expect(component.callEnd.emit).toHaveBeenCalledTimes(1);
    });

    it('should call "closeDialog" after end state', () => {
      expect(component.closeDialog).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should call "deinit" method', () => {
      component.ngOnDestroy();
      expect(webRtcService.deinit).toHaveBeenCalledTimes(1);
    });
  });

  describe('getters', () => {
    it('should get localContainerId', () => {
      expect(component.localContainerId).toBe('local');
    });

    it('should get remoteCalls', () => {
      expect(component.remoteCalls).toEqual(['1', '2', '3']);
    });

    it('should get cameraEnabled', () => {
      webRtcService.isVideoEnabled.mockReturnValue(true);
      expect(component.cameraEnabled).toBe(true);
    });

    it('should get microphoneEnabled', () => {
      webRtcService.isAudioEnabled.mockReturnValue(false);
      expect(component.microphoneEnabled).toBe(false);
    });

    it('should get fullScreenEnabled', () => {
      const fullscreenElement = vi.fn().mockReturnValueOnce(true);
      Object.assign(document, { fullscreenElement });
      expect(component.fullScreenEnabled).toBe(true);
    });

    it('should get blurEnabled', () => {
      webRtcService.isBlurEnabled.mockReturnValue(true);
      expect(component.blurEnabled).toBe(true);
    });

    it('should get useVirtualBackground', () => {
      webRtcService.useVirtualBackground.mockReturnValue(true);
      expect(component.useVirtualBackground).toBe(true);
    });

    it('should get screenShareEnabled', () => {
      webRtcService.isScreenShared.mockReturnValue(true);
      expect(component.screenShareEnabled).toBe(true);
    });
  });

  describe('onToggleCamera', () => {
    it('should call "toggleVideo" method with correct value', () => {
      component.onToggleCamera(true);
      expect(webRtcService.toggleVideo).toHaveBeenCalledWith(true);
    });
  });

  describe('onToggleMicrophone', () => {
    it('should call "toggleAudio" method with correct value', () => {
      component.onToggleMicrophone(false);
      expect(webRtcService.toggleAudio).toHaveBeenCalledWith(false);
    });
  });

  describe('onToggleFullScreen', () => {
    it('should call "toggleFullScreen" method with correct value', () => {
      component.onToggleFullScreen(false);
      expect(webRtcService.toggleFullScreen).toHaveBeenCalledWith(false);
    });
  });

  describe('onToggleBlur', () => {
    it('should call "toggleBlur" method with correct value', () => {
      component.onToggleBlur(true);
      expect(webRtcService.toggleBlur).toHaveBeenCalledWith(true);
    });
  });

  describe('onToggleScreenShare', () => {
    it('should call "toggleScreenShare" method with correct value', async () => {
      await component.onToggleScreenShare(true);
      expect(webRtcService.toggleScreenShare).toHaveBeenCalledWith(true);
    });
  });

  describe('onToggleSmallScreen', () => {
    beforeEach(() => {
      component.active = false;
      component.smallScreenEnabled = false;
      component.onToggleSmallScreen(true);
    });

    it('should invert "smallScreenEnabled" value', () => {
      expect(component.smallScreenEnabled).toBe(false);
    });

    it('should set "active" to true', () => {
      expect(component.active).toBe(true);
    });
  });

  describe('onEndCall', () => {
    it('should call "endCall" method', () => {
      component.onEndCall();
      expect(webRtcService.endCall).toHaveBeenCalledTimes(1);
    });
  });
});
