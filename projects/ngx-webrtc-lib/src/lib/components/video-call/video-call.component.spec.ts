import { ChangeDetectorRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VideoCallComponent } from './video-call.component';

describe('VideoCallComponent', () => {
  const audioSpy = {
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    load: vi.fn(),
    remove: vi.fn(),
  };

  const cdr = {
    markForCheck: vi.fn().mockName("ChangeDetectorRef.markForCheck")
  };

  let component: VideoCallComponent;
  let fixture: ComponentFixture<VideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoCallComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        {
          provide: ChangeDetectorRef,
          useValue: cdr,
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(VideoCallComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    component.data = {
      channel: '1234',
      outcome: true,
      uid: '12345',
      remoteUser: {
        name: 'Test',
        photoURL: '',
      },
    };

    Object.assign(globalThis, {
      Audio: class {
        play = audioSpy.play;
        pause = audioSpy.pause;
        stop = audioSpy.stop;
        load = audioSpy.load;
        remove = audioSpy.remove;
      }
    });

    vi.spyOn(component as any, 'play');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('get remoteUserName', () => {
    it('should return remote user name', () => {
      expect(component.remoteUserName).toBe('Test');
    });
  });

  describe('get remoteUserPhotoURL', () => {
    it('should return remote user photo URL', () => {
      expect(component.remoteUserPhotoURL).toBe('');
    });
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
      vi.spyOn(component.afterClosed, 'next');
      component.fullScreen = false;
      component.onAcceptCall();
    });

    it('should enable "fullScreen" mode', () => {
      expect(component.fullScreen).toBe(true);
    });

    it('should emit data outside', () => {
      expect(component.afterClosed.next).toHaveBeenCalledWith(component.data);
    });
  });

  describe('onDeclineCall', () => {
    beforeEach(() => {
      vi.spyOn(component, 'closeDialog');
    });

    it('should play "cancel" sound', () => {
      component.onDeclineCall();
      expect(component['play']).toHaveBeenCalledWith('assets/cancel.mp3');
    });

    it('should emit "closeDialog" after 200ms', () => {
      vi.useFakeTimers();
      component.onDeclineCall();

      vi.advanceTimersByTime(500);
      expect(component.closeDialog).toHaveBeenCalled();
    });

    afterEach(() => {
      expect(audioSpy.play).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
