import { TestBed } from '@angular/core/testing';

import { PostesactivitesService } from './postesactivites.service';

describe('PostesactivitesService', () => {
  let service: PostesactivitesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostesactivitesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
