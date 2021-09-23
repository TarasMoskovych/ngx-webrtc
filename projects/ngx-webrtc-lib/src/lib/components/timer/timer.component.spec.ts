import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
  let component: TimerComponent;

  beforeEach(() => {
    component = new TimerComponent();
    component.started = 0;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(Date, 'now').and.returnValue(100);
      spyOn(component, 'format');

      component.ngOnInit();
    });

    it('should call "format" value with correct data', fakeAsync(() => {
      component.time$.subscribe();
      tick();

      expect(component.format).toHaveBeenCalledWith(100);
      discardPeriodicTasks();
    }));
  });

  describe('format', () => {
    it('should return formatted time', () => {
      expect(component.format(100000)).toBe('00:01:40');
    });
  });
});
