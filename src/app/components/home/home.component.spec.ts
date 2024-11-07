import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { VideoCallDialogService } from '@app/ngx-webrtc-lib';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { STORAGE } from '../../app.config';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let formBuilder: UntypedFormBuilder;
  let router: jasmine.SpyObj<Router>;
  let localStorage: jasmine.SpyObj<Storage>;
  let videoCallDialogService: jasmine.SpyObj<VideoCallDialogService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    localStorage = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);
    videoCallDialogService = jasmine.createSpyObj('VideoCallDialogService', ['open']);
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: STORAGE,
          useValue: localStorage,
        },
        {
          provide: VideoCallDialogService,
          useValue: videoCallDialogService,
        },
        {
          provide: ChangeDetectorRef,
          useValue: cdr,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    formBuilder = TestBed.inject(UntypedFormBuilder);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('get channelId', () => {
    it('should return default channelId', () => {
      localStorage.getItem.and.returnValue(null);
      expect(component.channelId).toBe('test-channel-ngx-webrtc');
    });

    it('should return channelId taken from local storage', () => {
      const channelId = 'test-channel';
      localStorage.getItem.and.returnValue(channelId);

      expect(component.channelId).toBe(channelId);
    });
  });

  describe('get tooltipText', () => {
    it('should return "Outcome" when true', () => {
      component.outcome = true;
      expect(component.tooltipText).toBe('Outcome');
    });

    it('should return "Income" when false', () => {
      component.outcome = false;
      expect(component.tooltipText).toBe('Income');
    });
  });

  describe('ngOnInit', () => {
    it('should create form using form builder', () => {
      component.ngOnInit();
      expect(component.form).toBeDefined();
    });
  });

  describe('onSubmit', () => {
    const formData = {
      channelId: 'test-channel',
    };

    beforeEach(() => {
      spyOn(formBuilder, 'group').and.returnValue({ value: formData } as UntypedFormGroup);
      component.ngOnInit();
      component.onSubmit();
    });

    it('should save channelId to local storage', () => {
      expect(localStorage.setItem).toHaveBeenCalledOnceWith('ngx-webrtc:channelId', formData.channelId);
    });

    it('should redirect to conference with query params', () => {
      expect(router.navigate).toHaveBeenCalledOnceWith(
        ['conference'],
        { queryParams: { ...formData } },
      );
    });
  });

  describe('onModalOpen', () => {
    const getDialogData = (ms: number) => {
      return {
        acceptCall: jasmine.createSpy(),
        close: jasmine.createSpy(),
        afterConfirmation: () => of({}).pipe(delay(ms)),
        afterCallEnd: () => of(undefined).pipe(delay(ms)),
      } as any;
    };

    beforeEach(() => {
      spyOn(component, 'saveChannel');
    });

    it('should call "close" after 7 seconds', fakeAsync(() => {
      const ms = 7000;
      const spy = getDialogData(ms);

      videoCallDialogService.open.and.returnValue(spy);
      component.onModalOpen();

      tick(ms);
      expect(spy.close).toHaveBeenCalled();
      discardPeriodicTasks();
    }));

    it('should destroy the dialog after 5 seconds', fakeAsync(() => {
      const ms = 5000;
      const spy = getDialogData(ms);

      videoCallDialogService.open.and.returnValue(spy);
      component.onModalOpen();

      tick(ms);
      expect(spy.close).not.toHaveBeenCalled();
      expect(component.dialog).toBeNull();
    }));
  });
});
