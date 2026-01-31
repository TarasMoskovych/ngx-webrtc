import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ControlsComponent } from './controls.component';

describe('ControlsComponent', () => {
  let component: ControlsComponent;
  let fixture: ComponentFixture<ControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlsComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onToggleCamera', () => {
    beforeEach(() => {
      vi.spyOn(component.toggleCamera, 'emit');
    });

    it('should emit event', () => {
      component.onToggleCamera();
      expect(component.toggleCamera.emit).toHaveBeenCalledWith(component.cameraEnabled);
    });
  });

  describe('onToggleMicrophone', () => {
    beforeEach(() => {
      vi.spyOn(component.toggleMicrophone, 'emit');
    });

    it('should emit event', () => {
      component.onToggleMicrophone();
      expect(component.toggleMicrophone.emit).toHaveBeenCalledWith(component.microphoneEnabled);
    });
  });

  describe('onToggleFullScreen', () => {
    beforeEach(() => {
      vi.spyOn(component.toggleFullScreen, 'emit');
    });

    it('should emit event', () => {
      component.onToggleFullScreen();
      expect(component.toggleFullScreen.emit).toHaveBeenCalledWith(component.fullScreenEnabled);
    });
  });

  describe('onToggleSmallScreen', () => {
    beforeEach(() => {
      vi.spyOn(component.toggleSmallScreen, 'emit');
    });

    it('should emit event', () => {
      component.onToggleSmallScreen();
      expect(component.toggleSmallScreen.emit).toHaveBeenCalledWith(component.smallScreenEnabled);
    });
  });

  describe('onToggleScreenShare', () => {
    beforeEach(() => {
      vi.spyOn(component.toggleScreenShare, 'emit');
    });

    it('should emit event', () => {
      component.onToggleScreenShare();
      expect(component.toggleScreenShare.emit).toHaveBeenCalledWith(component.screenShareEnabled);
    });
  });

  describe('onEndCall', () => {
    beforeEach(() => {
      vi.spyOn(component.endCall, 'emit');
    });

    it('should emit event', () => {
      component.onEndCall();
      expect(component.endCall.emit).toHaveBeenCalledWith();
    });
  });
});
