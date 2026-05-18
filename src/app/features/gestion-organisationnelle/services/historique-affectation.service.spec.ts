import { TestBed } from '@angular/core/testing';

import { HistoriqueAffectationService } from './historique-affectation.service';

describe('HistoriqueAffectationService', () => {
  let service: HistoriqueAffectationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriqueAffectationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
