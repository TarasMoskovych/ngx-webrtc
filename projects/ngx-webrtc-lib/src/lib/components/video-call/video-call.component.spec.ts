import { ChangeDetectorRef, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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

  beforeEach(async () => {
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [VideoCallComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ChangeDetectorRef,
          useValue: cdr,
        },
      ],
    })
      .compileComponents();

    component = TestBed.createComponent(VideoCallComponent).componentInstance;
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

    spyOn(window, 'Audio').and.returnValue(audioSpy as any);
    spyOn<any>(component, 'play').and.callThrough();
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

    it('should emit "closeDialog" after 200ms', () => {
      jasmine.clock().install();
      component.onDeclineCall();

      jasmine.clock().tick(500);
      expect(component.closeDialog).toHaveBeenCalled();
    });

    afterEach(() => {
      expect(audioSpy.play).toHaveBeenCalled();
      jasmine.clock().uninstall();
    });
  });
});
