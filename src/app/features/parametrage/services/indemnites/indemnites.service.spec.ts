import { TestBed } from '@angular/core/testing';

import { IndemnitesService } from './indemnites.service';

describe('IndemnitesService', () => {
  let service: IndemnitesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndemnitesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
