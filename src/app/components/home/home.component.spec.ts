import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { VideoCallDialogService } from '@app/ngx-webrtc-lib';
import { delay, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE } from '../../app.config';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let formBuilder: UntypedFormBuilder;

  const router = {
    navigate: vi.fn(),
  };

  const localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };

  const videoCallDialogService = {
    open: vi.fn(),
  };

  const cdr = {
    markForCheck: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(),
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

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('get channelId', () => {
    it('should return default channelId', () => {
      localStorage.getItem(null);
      expect(component.channelId).toBe('test-channel-ngx-webrtc');
    });

    it('should return channelId taken from local storage', () => {
      const channelId = 'test-channel';
      localStorage.getItem.mockReturnValue(channelId);

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
      vi.spyOn(formBuilder, 'group').mockReturnValue({ value: formData } as UntypedFormGroup);
      component.ngOnInit();
      component.onSubmit();
    });

    it('should save channelId to local storage', () => {
      expect(localStorage.setItem).toHaveBeenCalledWith('ngx-webrtc:channelId', formData.channelId);
    });

    it('should redirect to conference with query params', () => {
      expect(router.navigate).toHaveBeenCalledWith(['conference'], { queryParams: { ...formData } });
    });
  });

  describe('onModalOpen', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    const getDialogData = (ms: number) => {
      return {
        acceptCall: vi.fn(),
        close: vi.fn(),
        afterConfirmation: () => of({}).pipe(delay(ms)),
        afterCallEnd: () => of(undefined).pipe(delay(ms)),
      } as any;
    };

    beforeEach(() => {
      vi.spyOn(component, 'saveChannel');
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call "close" after 7 seconds', () => {
      const ms = 7000;
      const spy = getDialogData(ms);

      videoCallDialogService.open.mockReturnValue(spy);
      component.onModalOpen();

      vi.advanceTimersByTime(ms);
      expect(spy.close).toHaveBeenCalled();
    });

    it('should destroy the dialog after 5 seconds', () => {
      const ms = 5000;
      const spy = getDialogData(ms);

      videoCallDialogService.open.mockReturnValue(spy);
      component.onModalOpen();

      vi.advanceTimersByTime(ms);
      expect(spy.close).not.toHaveBeenCalled();
      expect(component.dialog).toBeNull();
    });
  });
});
