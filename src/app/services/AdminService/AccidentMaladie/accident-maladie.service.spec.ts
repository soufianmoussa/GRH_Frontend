import { TestBed } from '@angular/core/testing';

import { AccidentMaladieService } from './accident-maladie.service';

describe('AccidentMaladieService', () => {
  let service: AccidentMaladieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccidentMaladieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
