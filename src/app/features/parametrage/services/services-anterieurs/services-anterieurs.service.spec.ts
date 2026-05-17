import { TestBed } from '@angular/core/testing';

import { ServicesAnterieursService } from './services-anterieurs.service';

describe('ServicesAnterieursService', () => {
  let service: ServicesAnterieursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesAnterieursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
