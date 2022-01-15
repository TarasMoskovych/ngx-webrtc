import { ChangeDetectorRef } from '@angular/core';
import { DialogComponent } from './abstract-dialog.component';

class TestComponent extends DialogComponent {}

describe('DialogComponent', () => {
  let component: TestComponent;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);
    component = new TestComponent(cdr);

    spyOn(component.afterClosed, 'next');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('closeDialog', () => {
    beforeEach(() => {
      component.closeDialog(true);
    });

    it('should emit "afterClosed" with some data', () => {
      expect(component.afterClosed.next).toHaveBeenCalledOnceWith(true);
    });

    it('should call "markForCheck"', () => {
      expect(cdr.markForCheck).toHaveBeenCalled();
    });
  });
});
