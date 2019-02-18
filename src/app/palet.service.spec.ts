import { TestBed } from '@angular/core/testing';

import { PaletService } from './palet.service';

describe('PaletService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PaletService = TestBed.get(PaletService);
    expect(service).toBeTruthy();
  });
});
