import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('get color', () => {
    it('should return correct color for "ended" state', () => {
      component.ended = true;
      expect(component.color).toBe('#aaa');
    });

    it('should return correct color for "error" state', () => {
      component.error = true;
      expect(component.color).toBe('#d73b3d');
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
