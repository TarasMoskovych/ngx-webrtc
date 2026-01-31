
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStreamViewComponent } from './local-stream-view.component';

describe('LocalStreamViewComponent', () => {
  let component: LocalStreamViewComponent;
  let fixture: ComponentFixture<LocalStreamViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalStreamViewComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalStreamViewComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

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
      const toggleBlurSpy = vi.spyOn(component.toggleBlur, 'emit');
      component.onToggleBlur();

      expect(toggleBlurSpy).toHaveBeenCalledWith(component.blurEnabled);
    });
  });
});
