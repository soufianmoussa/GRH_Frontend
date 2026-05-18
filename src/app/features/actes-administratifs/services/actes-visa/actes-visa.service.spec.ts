import { TestBed } from '@angular/core/testing';

import { ActesVisaService } from './actes-visa.service';

describe('ActesVisaService', () => {
  let service: ActesVisaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActesVisaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
