import { TestBed } from '@angular/core/testing';

import { AncienneteService } from './anciennete.service';

describe('AncienneteService', () => {
  let service: AncienneteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AncienneteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
