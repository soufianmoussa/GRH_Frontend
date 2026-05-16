import { TestBed } from '@angular/core/testing';

import { FamilleProfessionnelleService } from './famille-professionnelle.service';

describe('FamilleProfessionnelleService', () => {
  let service: FamilleProfessionnelleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FamilleProfessionnelleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
