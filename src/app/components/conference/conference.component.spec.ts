import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { WebRtcComponent } from '@app/ngx-webrtc-lib';
import { ConferenceComponent } from './conference.component';

@Component({
  selector: 'ngx-webrtc',
})
class MockWebRtcComponent {}

describe('ConferenceComponent', () => {
  let component: ConferenceComponent;
  let router: jasmine.SpyObj<Router>;
  let route: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    route = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        queryParams: {
          channelId: undefined,
        },
      },
    });

    TestBed.configureTestingModule({
      imports: [ConferenceComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ActivatedRoute,
          useValue: route,
        },
        {
          provide: Router,
          useValue: router,
        },
      ],
    })
      .overrideComponent(ConferenceComponent, {
        remove: { imports: [WebRtcComponent] },
        add: { imports: [MockWebRtcComponent] },
      })
      .compileComponents();

    component = TestBed.createComponent(ConferenceComponent).componentInstance;
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
