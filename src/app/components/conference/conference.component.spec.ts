import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { WebRtcComponent } from '@app/ngx-webrtc-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConferenceComponent } from './conference.component';

@Component({
  selector: 'ngx-webrtc',
  template: '',
})
class MockWebRtcComponent { }

describe('ConferenceComponent', () => {
  let component: ConferenceComponent;
  let fixture: ComponentFixture<ConferenceComponent>;

  const router = {
    navigateByUrl: vi.fn(),
  };

  const route = {
    snapshot: {
      queryParams: {
        channelId: undefined,
      },
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
        add: { imports: [MockWebRtcComponent], schemas: [CUSTOM_ELEMENTS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ConferenceComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
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
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });
});
