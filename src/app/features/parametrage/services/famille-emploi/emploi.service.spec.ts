import { TestBed } from '@angular/core/testing';

import { EmploiService } from './emploi.service';

describe('EmploiService', () => {
  let service: EmploiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmploiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
