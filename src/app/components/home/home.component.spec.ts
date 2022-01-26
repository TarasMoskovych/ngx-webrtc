import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

// import { VideoCallDialogService } from 'projects/ngx-webrtc-lib/src/public-api';
import { VideoCallDialogService } from 'ngx-webrtc-lib';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let formBuilder: jasmine.SpyObj<FormBuilder>;
  let router: jasmine.SpyObj<Router>;
  let localStorage: jasmine.SpyObj<Storage>;
  let videoCallDialogService: jasmine.SpyObj<VideoCallDialogService>;

  beforeEach(() => {
    formBuilder = jasmine.createSpyObj('FormBuilder', ['group']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    localStorage = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);
    videoCallDialogService = jasmine.createSpyObj('VideoCallDialogService', ['open']);

    component = new HomeComponent(formBuilder, router, localStorage, videoCallDialogService);
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
      expect(formBuilder.group).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    const formData = {
      channelId: 'test-channel',
    };

    beforeEach(() => {
      formBuilder.group.and.returnValue({ value: formData } as FormGroup);
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
    const spy = {
      acceptCall: jasmine.createSpy(),
      close: jasmine.createSpy(),
      afterConfirmation: () => of(undefined),
      afterCallEnd: jasmine.createSpy(),
    } as any;

    beforeEach(() => {
      spyOn(component, 'saveChannel');
      videoCallDialogService.open.and.returnValue(spy);
    });

    it('should call "open" with the data', () => {
      component.onModalOpen();
      expect(videoCallDialogService.open).toHaveBeenCalled();
    });

    it('should call "close" after 7 seconds', fakeAsync(() => {
      component.onModalOpen();

      tick(7000);
      expect(spy.close).toHaveBeenCalled();
    }));
  });
});
