
import { LocalStreamViewComponent } from './local-stream-view.component';

describe('LocalStreamViewComponent', () => {
  const component = new LocalStreamViewComponent();

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('get userName', () => {
    it('should return user name', () => {
      component.user = { name: 'Test', photoURL: '' };
      expect(component.userName).toBe('Test');
    });

    it('should return "Me" as a fallback', () => {
      component.user = null;
      expect(component.userName).toBe('Me');
    });
  });

  describe('onToggleBlur', () => {
    it('should emit blurEnabled', () => {
      const toggleBlurSpy = spyOn(component.toggleBlur, 'emit');
      component.onToggleBlur();

      expect(toggleBlurSpy).toHaveBeenCalledWith(component.blurEnabled);
    });
  });
});
