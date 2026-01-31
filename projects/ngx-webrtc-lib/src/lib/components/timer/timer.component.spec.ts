import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
      vi.spyOn(Date, 'now').mockReturnValue(100);
      vi.spyOn(component, 'format');
      vi.useFakeTimers();
      component.ngOnInit();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call "format" value with correct data', () => {
      component.time$.subscribe();
      vi.advanceTimersByTime(0);

      expect(component.format).toHaveBeenCalledWith(100);
    });
  });

  describe('format', () => {
    it('should return formatted time', () => {
      expect(component.format(100000)).toBe('00:01:40');
    });
  });
});
