import { ChangeDetectorRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogComponent } from './abstract-dialog.component';

@Component({})
class TestComponent extends DialogComponent {}

describe('DialogComponent', () => {
  let component: TestComponent;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

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
  });
});
