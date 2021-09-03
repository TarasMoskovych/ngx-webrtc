import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebRtcComponent } from './webrtc.component';

describe('WebRtcComponent', () => {
  let component: WebRtcComponent;
  let fixture: ComponentFixture<WebRtcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebRtcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebRtcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
