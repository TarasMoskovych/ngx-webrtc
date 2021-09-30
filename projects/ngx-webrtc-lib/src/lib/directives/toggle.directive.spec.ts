import { Renderer2 } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { ToggleDirective } from './toggle.directive';

describe('ToggleDirective', () => {
  const element = {
    nativeElement: {},
  };
  let renderer: jasmine.SpyObj<Renderer2>;
  let directive: ToggleDirective;

  beforeEach(() => {
    renderer = jasmine.createSpyObj('Renderer2', ['setStyle']);
    directive = new ToggleDirective(renderer, element);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  describe('onEnter', () => {
    it('should call "setStyle" method', () => {
      spyOn(directive, 'setStyle');
      directive.onEnter();

      expect(directive.setStyle).toHaveBeenCalledOnceWith(1);
    });
  });

  describe('onLeave', () => {
    it('should call "setStyle" method', () => {
      spyOn(directive, 'hide');
      directive.onLeave();

      expect(directive.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('ngOnInit', () => {
    it('should call "setStyle" method', () => {
      spyOn(directive, 'hide');
      directive.ngOnInit();

      expect(directive.hide).toHaveBeenCalledTimes(1);
    });
  });

  describe('hide', () => {
    it('should call "setStyle" method after delay', fakeAsync(() => {
      spyOn(directive, 'setStyle');
      directive.hide();

      tick(5000);

      expect(directive.setStyle).toHaveBeenCalledOnceWith(0);
    }));
  });

  describe('setStyle', () => {
    it('should call renderer "setStyle" method', () => {
      directive.setStyle(0);
      expect(renderer.setStyle).toHaveBeenCalledOnceWith(element.nativeElement, 'opacity', 0);
    });
  });
});
