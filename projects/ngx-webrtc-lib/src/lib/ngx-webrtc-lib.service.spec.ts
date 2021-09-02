import { TestBed } from '@angular/core/testing';

import { NgxWebrtcLibService } from './ngx-webrtc-lib.service';

describe('NgxWebrtcLibService', () => {
  let service: NgxWebrtcLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxWebrtcLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
