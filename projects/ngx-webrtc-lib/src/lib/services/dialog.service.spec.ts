import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DialogComponent } from '../components';

import { DialogService } from './dialog.service';

@Component({
  template: '<p>Test</p>',
})
class TestComponent extends DialogComponent {
  @Input() channel: string;

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }
}

describe('DialogService', () => {
  const channel = 'test-channel';
  let service: DialogService;
  let ngDocument: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    service = TestBed.inject(DialogService);
    ngDocument = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should create a component and attach it inside the wrapper with props', () => {
      const component = service.open(TestComponent, { channel });
      expect((component as TestComponent).channel).toBe(channel);
    });

    it('should create only one single wrapper for dialog', () => {
      service.open(TestComponent);
      service.open(TestComponent);
      service.open(TestComponent);

      expect(ngDocument.querySelectorAll('.ngx-webrtc-wrapper').length).toBe(1);
    });

    it('should destroy the component on "afterClosed"', fakeAsync(() => {
      const instance = service.open(TestComponent);

      spyOn(service['appRef'], 'detachView');
      instance.afterClosed.next();
      tick(500);

      expect(service['appRef'].detachView).toHaveBeenCalled();
    }));
  });
});
