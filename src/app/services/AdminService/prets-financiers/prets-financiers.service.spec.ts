import { TestBed } from '@angular/core/testing';

import { PretsFinanciersService } from './prets-financiers.service';

describe('PretsFinanciersService', () => {
  let service: PretsFinanciersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PretsFinanciersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
