import { TestBed } from '@angular/core/testing';

import { DemandesAttestationService } from './demandes-attestation.service';

describe('DemandesAttestationService', () => {
  let service: DemandesAttestationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandesAttestationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
