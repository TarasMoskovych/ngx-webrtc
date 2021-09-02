import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxWebrtcLibComponent } from './ngx-webrtc-lib.component';

describe('NgxWebrtcLibComponent', () => {
  let component: NgxWebrtcLibComponent;
  let fixture: ComponentFixture<NgxWebrtcLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxWebrtcLibComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxWebrtcLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
