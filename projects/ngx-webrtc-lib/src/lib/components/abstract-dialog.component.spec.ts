import { ChangeDetectorRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogComponent } from './abstract-dialog.component';

@Component({
  template: '',
})
class TestComponent extends DialogComponent {
}

describe('DialogComponent', () => {
  let component: TestComponent;
  const cdr = {
    markForCheck: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        {
          provide: ChangeDetectorRef,
          useValue: cdr,
        },
      ],
    })
      .compileComponents();

    component = TestBed.createComponent(TestComponent).componentInstance;
    vi.spyOn(component.afterClosed, 'next');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('closeDialog', () => {
    beforeEach(() => {
      component.closeDialog(true);
    });

    it('should emit "afterClosed" with some data', () => {
      expect(component.afterClosed.next).toHaveBeenCalledWith(true);
    });
  });
});
