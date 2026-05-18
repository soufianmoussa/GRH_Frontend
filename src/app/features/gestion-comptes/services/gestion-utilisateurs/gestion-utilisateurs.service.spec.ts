import { TestBed } from '@angular/core/testing';

import { GestionUtilisateursService } from './gestion-utilisateurs.service';

describe('GestionUtilisateursService', () => {
  let service: GestionUtilisateursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionUtilisateursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
