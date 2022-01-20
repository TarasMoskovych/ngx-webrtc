import { ChangeDetectorRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { VideoCallComponent } from './video-call.component';

describe('VideoCallComponent', () => {
  const audioSpy = {
    play: jasmine.createSpy(),
    pause: jasmine.createSpy(),
    stop: jasmine.createSpy(),
    load: jasmine.createSpy(),
    remove: jasmine.createSpy(),
  };
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let component: VideoCallComponent;

  beforeEach(() => {
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);
    component = new VideoCallComponent(cdr);
    component.data = {
      channel: '1234',
      outcome: true,
      uid: '12345',
      user: {
        name: 'Test',
        photoURL: '',
      },
    };

    spyOn(window, 'Audio').and.returnValue(audioSpy as any);
    spyOn<any>(component, 'play').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should play "outcome" sound', () => {
      component.ngOnInit();
      expect(component['play']).toHaveBeenCalledWith('assets/outcome.mp3');
    });

    it('should play "income" sound', () => {
      component.data.outcome = false;
      component.ngOnInit();
      expect(component['play']).toHaveBeenCalledWith('assets/income.mp3');
    });

    afterEach(() => {
      expect(audioSpy.play).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should "remove" audio', () => {
      component.ngOnDestroy();
      expect(audioSpy.remove).toHaveBeenCalled();
    });
  });

  describe('onAcceptCall', () => {
    beforeEach(() => {
      spyOn(component.afterClosed, 'next');
      component.fullScreen = false;
      component.onAcceptCall();
    });

    it('should enable "fullScreen" mode', () => {
      expect(component.fullScreen).toBeTrue();
    });

    it('should emit data outside', () => {
      expect(component.afterClosed.next).toHaveBeenCalledWith(component.data);
    });
  });

  describe('onDeclineCall', () => {
    beforeEach(() => {
      spyOn(component, 'closeDialog');
    });

    it('should play "cancel" sound', () => {
      component.onDeclineCall();
      component.onDeclineCall();

      expect(component['play']).toHaveBeenCalledWith('assets/cancel.mp3');
    });

    it('should emit "closeDialog" after 200ms', fakeAsync(() => {
      component.onDeclineCall();

      tick(500);
      expect(component.closeDialog).toHaveBeenCalled();
    }));

    afterEach(() => {
      expect(audioSpy.play).toHaveBeenCalled();
    });
  });
});
