import { TestBed } from '@angular/core/testing';

import { NoteAnnuelleService } from './note-annuelle.service';

describe('NoteAnnuelleService', () => {
  let service: NoteAnnuelleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteAnnuelleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
