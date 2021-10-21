import { ActivatedRoute, Router } from '@angular/router';
import { ConferenceComponent } from './conference.component';

describe('ConferenceComponent', () => {
  let component: ConferenceComponent;
  let router: jasmine.SpyObj<Router>;
  let route: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    route = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParams: {
          channelId: undefined,
        },
      },
    });
    component = new ConferenceComponent(route, router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set channel', () => {
      component.ngOnInit();
      expect(component.channel).toBe('test-channel');
    });
  });

  describe('onCallEnd', () => {
    it('should redirect to home page', () => {
      component.onCallEnd();
      expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/');
    });
  });
});
