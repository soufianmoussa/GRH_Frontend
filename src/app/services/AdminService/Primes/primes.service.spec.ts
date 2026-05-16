import { TestBed } from '@angular/core/testing';

import { PrimesService } from './primes.service';

describe('PrimesService', () => {
  let service: PrimesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrimesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
