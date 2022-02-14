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
      'toggleVideo',
      'toggleAudio',
      'toggleFullScreen',
      'endCall',
    ], {
      streamState$: of(null),
      remoteStreamVideoToggle$: of(false),
      localContainerId: 'local',
      remoteCalls: ['1', '2', '3'],
    });
    component = new WebRtcComponent(webRtcService, cdr);
    component.uid = '1234';
    component.debug = true;
    component.channel = 'test_channel';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(component.callEnd, 'emit');
      spyOn(component, 'closeDialog');
      webRtcService.init.and.returnValue(of(undefined));
      component.ngOnInit();
    });

    it('should call "init" method with parameters', () => {
      expect(webRtcService.init).toHaveBeenCalledOnceWith(component.uid, component.channel, component.debug);
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
      webRtcService.isVideoEnabled.and.returnValue(true);
      expect(component.cameraEnabled).toBeTrue();
    });

    it('should get microphoneEnabled', () => {
      webRtcService.isAudioEnabled.and.returnValue(false);
      expect(component.microphoneEnabled).toBeFalse();
    });

    it('should get fullScreenEnabled', () => {
      spyOnProperty(document, 'fullscreenElement').and.returnValue({});
      expect(component.fullScreenEnabled).toBeTrue();
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
