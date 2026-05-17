import { TestBed } from '@angular/core/testing';

import { CongeMaterniteService } from './conge-maternite.service';

describe('CongeMaterniteService', () => {
  let service: CongeMaterniteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CongeMaterniteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
