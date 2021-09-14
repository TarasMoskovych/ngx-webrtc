import { NgxAgoraService } from 'ngx-agora';
import { WebRtcService } from './web-rtc.service';

describe('WebRtcService', () => {
  let service: WebRtcService;
  let agoraService: jasmine.SpyObj<NgxAgoraService>;

  beforeEach(() => {
    agoraService = jasmine.createSpyObj('NgxAgoraService', ['createClient'], {
      config: {
        AppId: '12345',
      },
    });
    service = new WebRtcService(agoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
