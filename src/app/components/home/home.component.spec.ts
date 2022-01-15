import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { WebRtcService } from 'src/app/ngx-webrtc.export';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let formBuilder: jasmine.SpyObj<FormBuilder>;
  let router: jasmine.SpyObj<Router>;
  let localStorage: jasmine.SpyObj<Storage>;
  let webRtcService: jasmine.SpyObj<WebRtcService>;

  beforeEach(() => {
    formBuilder = jasmine.createSpyObj('FormBuilder', ['group']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    localStorage = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);
    webRtcService = jasmine.createSpyObj('WebRtcService', ['openDialog']);

    component = new HomeComponent(formBuilder, router, localStorage, webRtcService);
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
    };

    beforeEach(() => {
      spyOn(component, 'saveChannel');
      webRtcService.openDialog.and.returnValue(spy);
    });

    it('should call "openDialog" with the data', () => {
      component.onModalOpen();

      expect(webRtcService.openDialog).toHaveBeenCalledWith({
        uid: '1234567',
        channelId: component.channelId,
        outcome: component.outcome,
        user: {
          name: 'Test User',
          photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvDtoEwuV9E2kHqNDi6MnBzXlefn8TfyrwgQ&usqp=CAU',
        },
      });
    });

    it('should call "close" after 7 seconds', fakeAsync(() => {
      component.onModalOpen();

      tick(7000);
      expect(spy.close).toHaveBeenCalled();
    }));
  });
});
