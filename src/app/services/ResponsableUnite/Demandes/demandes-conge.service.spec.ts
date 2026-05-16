import { TestBed } from '@angular/core/testing';

import { DemandesCongeService } from './demandes-conge.service';

describe('DemandesCongeService', () => {
  let service: DemandesCongeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandesCongeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
