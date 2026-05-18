import { TestBed } from '@angular/core/testing';

import { UniteStructurelleService } from './unite-structurelle.service';

describe('UniteStructurelleService', () => {
  let service: UniteStructurelleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniteStructurelleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
