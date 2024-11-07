import { TestBed } from '@angular/core/testing';

import { appConfig, STORAGE } from 'src/app/app.config';

describe('appConfig', () => {
  let storage: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
      ],
    });

    storage = TestBed.inject(STORAGE);
  });

  it('should provide STORAGE based on platform', () => {
    expect(storage).toBe(localStorage);
  });
});
