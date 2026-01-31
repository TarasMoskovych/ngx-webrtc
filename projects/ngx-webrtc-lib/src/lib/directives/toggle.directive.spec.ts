import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToggleDirective } from './toggle.directive';

@Component({
  template: `<div ngxToggle (toggleVisibility)="onToggleVisibility()">Content</div>`,
  standalone: true,
  imports: [ToggleDirective],
})
class TestHostComponent {
  onToggleVisibility() {
  }
}

describe('ToggleDirective', () => {
  let directive: ToggleDirective;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    directive = fixture.debugElement.query(By.directive(ToggleDirective)).injector.get(ToggleDirective);

    await fixture.whenStable();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  describe('onEnter', () => {
    it('should call "setStyle" method', () => {
      vi.spyOn(directive, 'setStyle');
      directive.onEnter();

      expect(directive.setStyle).toHaveBeenCalledTimes(1);
    });
  });

  describe('onLeave', () => {
    it('should call "setStyle" method', () => {
      vi.spyOn(directive, 'hide');
      directive.onLeave();

      expect(directive.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('ngOnInit', () => {
    it('should call "setStyle" method', () => {
      vi.spyOn(directive, 'hide');
      directive.ngOnInit();

      expect(directive.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('hide', () => {
    it('should call "setStyle" method after delay', () => {
      vi.useFakeTimers();
      vi.spyOn(directive, 'setStyle');
      directive.hide();

      vi.advanceTimersByTime(5000);
      expect(directive.setStyle).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });
});
