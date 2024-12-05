import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

import { WebRtcService } from './services';
import { WebRtcComponent } from './webrtc.component';

describe('WebRtcComponent', () => {
  let component: WebRtcComponent;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let webRtcService: jasmine.SpyObj<WebRtcService>;

  beforeEach(() => {
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);
    webRtcService = jasmine.createSpyObj('WebRtcService', [
      'init',
      'deinit',
      'isVideoEnabled',
      'isAudioEnabled',
      'isBlurEnabled',
      'toggleVideo',
      'toggleAudio',
      'toggleFullScreen',
      'toggleBlur',
      'useVirtualBackground',
      'endCall',
    ], {
      streamState$: of(null),
      remoteStreamVideoToggle$: of(false),
      localContainerId: 'local',
      remoteCalls: ['1', '2', '3'],
    });
    component = new WebRtcComponent(webRtcService, cdr);
    component.uid = '1234';
    component.channel = 'test_channel';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInitWebRtc', () => {
    beforeEach(() => {
      spyOn(component.callEnd, 'emit');
      spyOn(component, 'closeDialog');
      webRtcService.init.and.returnValue(of(undefined));
      component.onInitWebRtc();
    });

    it('should call "init" method with parameters', () => {
      expect(webRtcService.init).toHaveBeenCalledOnceWith(component.uid, component.channel, component.token);
    });

    it('should emit "callEnd" event after end state', () => {
      expect(component.callEnd.emit).toHaveBeenCalledTimes(1);
    });

    it('should call "closeDialog" after end state', () => {
      expect(component.closeDialog).toHaveBeenCalled();
    });

    it('should be initialized only once', () => {
      component.onInitWebRtc();
      expect(webRtcService.init).toHaveBeenCalledTimes(1);
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
      webRtcService.isVideoEnabled.and.returnValue(true);
      expect(component.cameraEnabled).toBeTrue();
    });

    it('should get microphoneEnabled', () => {
      webRtcService.isAudioEnabled.and.returnValue(false);
      expect(component.microphoneEnabled).toBeFalse();
    });

    it('should get fullScreenEnabled', () => {
      spyOnProperty(document, 'fullscreenElement').and.returnValue({} as Element);
      expect(component.fullScreenEnabled).toBeTrue();
    });

    it('should get blurEnabled', () => {
      webRtcService.isBlurEnabled.and.returnValue(true);
      expect(component.blurEnabled).toBeTrue();
    });

    it('should get useVirtualBackground', () => {
      webRtcService.useVirtualBackground.and.returnValue(true);
      expect(component.useVirtualBackground).toBeTrue();
    });
  });

  describe('onToggleCamera', () => {
    it('should call "toggleVideo" method with correct value', () => {
      component.onToggleCamera(true);
      expect(webRtcService.toggleVideo).toHaveBeenCalledOnceWith(true);
    });
  });

  describe('onToggleMicrophone', () => {
    it('should call "toggleAudio" method with correct value', () => {
      component.onToggleMicrophone(false);
      expect(webRtcService.toggleAudio).toHaveBeenCalledOnceWith(false);
    });
  });

  describe('onToggleFullScreen', () => {
    it('should call "toggleFullScreen" method with correct value', () => {
      component.onToggleFullScreen(false);
      expect(webRtcService.toggleFullScreen).toHaveBeenCalledOnceWith(false);
    });
  });

  describe('onToggleBlur', () => {
    it('should call "toggleBlur" method with correct value', () => {
      component.onToggleBlur(true);
      expect(webRtcService.toggleBlur).toHaveBeenCalledOnceWith(true);
    });
  });

  describe('onToggleSmallScreen', () => {
    beforeEach(() => {
      component.active = false;
      component.smallScreenEnabled = false;
      component.onToggleSmallScreen(true);
    });

    it('should invert "smallScreenEnabled" value', () => {
      expect(component.smallScreenEnabled).toBeFalse();
    });

    it('should set "active" to true', () => {
      expect(component.active).toBeTrue();
    });
  });

  describe('onEndCall', () => {
    it('should call "endCall" method', () => {
      component.onEndCall();
      expect(webRtcService.endCall).toHaveBeenCalledTimes(1);
    });
  });
});
