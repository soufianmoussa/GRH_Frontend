import { TestBed } from '@angular/core/testing';

import { ResponsableUniteService } from './responsable-unite.service';

describe('ResponsableUniteService', () => {
  let service: ResponsableUniteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsableUniteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
