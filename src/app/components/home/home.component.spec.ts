import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let formBuilder: jasmine.SpyObj<FormBuilder>;
  let router: jasmine.SpyObj<Router>;
  let localStorage: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    formBuilder = jasmine.createSpyObj('FormBuilder', ['group']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    localStorage = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);

    component = new HomeComponent(formBuilder, router, localStorage);
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
});
