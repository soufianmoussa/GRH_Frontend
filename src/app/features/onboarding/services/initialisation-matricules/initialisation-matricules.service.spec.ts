import { TestBed } from '@angular/core/testing';

import { InitialisationMatriculesService } from './initialisation-matricules.service';

describe('InitialisationMatriculesService', () => {
  let service: InitialisationMatriculesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitialisationMatriculesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
