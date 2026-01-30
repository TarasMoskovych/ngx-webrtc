import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
  let component: TimerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    component = TestBed.createComponent(TimerComponent).componentInstance;
    component.started = 0;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(Date, 'now').and.returnValue(100);
      spyOn(component, 'format');
      jasmine.clock().install();
      component.ngOnInit();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should call "format" value with correct data', () => {
      component.time$.subscribe();
      jasmine.clock().tick(0);

      expect(component.format).toHaveBeenCalledWith(100);
    });
  });

  describe('format', () => {
    it('should return formatted time', () => {
      expect(component.format(100000)).toBe('00:01:40');
    });
  });
});
