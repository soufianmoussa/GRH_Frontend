import { TestBed } from '@angular/core/testing';

import { GroupeCompetenceService } from './groupe-competence.service';

describe('GroupeCompetenceService', () => {
  let service: GroupeCompetenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupeCompetenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
