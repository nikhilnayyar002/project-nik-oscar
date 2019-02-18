import { TestBed } from '@angular/core/testing';

import { SignInCheckService } from './sign-in-check.service';

describe('SignInCheckService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SignInCheckService = TestBed.get(SignInCheckService);
    expect(service).toBeTruthy();
  });
});
