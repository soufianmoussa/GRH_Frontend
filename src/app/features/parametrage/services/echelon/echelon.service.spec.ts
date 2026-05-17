import { TestBed } from '@angular/core/testing';

import { EchelonService } from './echelon.service';

describe('EchelonService', () => {
  let service: EchelonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EchelonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
