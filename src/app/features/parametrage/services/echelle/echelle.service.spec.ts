import { TestBed } from '@angular/core/testing';

import { EchelleService } from './echelle.service';

describe('EchelleService', () => {
  let service: EchelleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EchelleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
