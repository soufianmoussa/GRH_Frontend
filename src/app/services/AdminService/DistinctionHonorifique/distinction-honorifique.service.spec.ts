import { TestBed } from '@angular/core/testing';

import { DistinctionHonorifiqueService } from './distinction-honorifique.service';

describe('DistinctionHonorifiqueService', () => {
  let service: DistinctionHonorifiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DistinctionHonorifiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
