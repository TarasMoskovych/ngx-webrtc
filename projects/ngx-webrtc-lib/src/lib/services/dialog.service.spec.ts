import { Component, DOCUMENT, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogComponent } from '../components';

import { DialogService } from './dialog.service';

@Component({
  template: '<p>Test</p>',
})
class TestComponent extends DialogComponent {
  @Input() channel: string;
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

    it('should destroy the component on "afterClosed"', () => {
      const instance = service.open(TestComponent);
      jasmine.clock().install();

      spyOn(service['appRef'], 'detachView');
      instance.afterClosed.next(undefined);
      jasmine.clock().tick(500);

      expect(service['appRef'].detachView).toHaveBeenCalled();
      jasmine.clock().uninstall();
    });
  });
});
