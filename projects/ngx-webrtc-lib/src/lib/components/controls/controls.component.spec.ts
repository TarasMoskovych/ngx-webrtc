import { ControlsComponent } from './controls.component';

describe('ControlsComponent', () => {
  let component: ControlsComponent;

  beforeEach(() => {
    component = new ControlsComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onToggleCamera', () => {
    beforeEach(() => {
      spyOn(component.toggleCamera, 'emit');
    });

    it('should emit event', () => {
      component.onToggleCamera();
      expect(component.toggleCamera.emit).toHaveBeenCalledWith(component.cameraEnabled);
    });
  });

  describe('onToggleMicrophone', () => {
    beforeEach(() => {
      spyOn(component.toggleMicrophone, 'emit');
    });

    it('should emit event', () => {
      component.onToggleMicrophone();
      expect(component.toggleMicrophone.emit).toHaveBeenCalledWith(component.microphoneEnabled);
    });
  });

  describe('onToggleFullScreen', () => {
    beforeEach(() => {
      spyOn(component.toggleFullScreen, 'emit');
    });

    it('should emit event', () => {
      component.onToggleFullScreen();
      expect(component.toggleFullScreen.emit).toHaveBeenCalledWith(component.fullScreenEnabled);
    });
  });

  describe('onToggleSmallScreen', () => {
    beforeEach(() => {
      spyOn(component.toggleSmallScreen, 'emit');
    });

    it('should emit event', () => {
      component.onToggleSmallScreen();
      expect(component.toggleSmallScreen.emit).toHaveBeenCalledWith(component.smallScreenEnabled);
    });
  });

  describe('onEndCall', () => {
    beforeEach(() => {
      spyOn(component.endCall, 'emit');
    });

    it('should emit event', () => {
      component.onEndCall();
      expect(component.endCall.emit).toHaveBeenCalledWith();
    });
  });
});
