import { TestBed } from '@angular/core/testing';

import { FamilleEmploiService } from './famille-emploi.service';

describe('FamilleEmploiService', () => {
  let service: FamilleEmploiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FamilleEmploiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
