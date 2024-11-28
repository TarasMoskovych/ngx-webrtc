
import { LocalStreamViewComponent } from './local-stream-view.component';

describe('LocalStreamViewComponent', () => {
  const component = new LocalStreamViewComponent();

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onToggleBlur', () => {
    it('should emit blurEnabled', () => {
      const toggleBlurSpy = spyOn(component.toggleBlur, 'emit');
      component.onToggleBlur();

      expect(toggleBlurSpy).toHaveBeenCalledWith(component.blurEnabled);
    });
  });
});
