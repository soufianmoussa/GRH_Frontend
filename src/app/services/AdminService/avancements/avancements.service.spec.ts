import { TestBed } from '@angular/core/testing';

import { AvancementsService } from './avancements.service';

describe('AvancementsService', () => {
  let service: AvancementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvancementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
