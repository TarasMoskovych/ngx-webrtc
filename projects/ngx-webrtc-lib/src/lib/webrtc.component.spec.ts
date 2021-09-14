import { WebRtcService } from './services';
import { WebRtcComponent } from './webrtc.component';

describe('WebRtcComponent', () => {
  let component: WebRtcComponent;
  let webRtcService: jasmine.SpyObj<WebRtcService>;

  beforeEach(() => {
    webRtcService = jasmine.createSpyObj('WebRtcService', ['']);
    component = new WebRtcComponent(webRtcService);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
