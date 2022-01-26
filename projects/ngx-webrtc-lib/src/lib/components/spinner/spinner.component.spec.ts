import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;

  beforeEach(() => {
    component = new SpinnerComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('get color', () => {
    it('should return correct color for "ended" state', () => {
      component.ended = true;
      expect(component.color).toBe('#aaa');
    });

    it('should return correct color for "connected" state', () => {
      component.connected = true;
      expect(component.color).toBe('#37D425');
    });

    it('should return correct color for "not connected" state', () => {
      component.connected = false;
      expect(component.color).toBe('#1195E6');
    });
  });
});
