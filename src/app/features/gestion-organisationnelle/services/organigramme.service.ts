import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environment.prod';
import { OrganigrammeNode } from '../../../models/gestionOrganisationelle/organigramme.model';

@Injectable({
  providedIn: 'root'
})
export class OrganigrammeService {

  private readonly baseUrl = `${environment.apiUrl}/gestion-organisationelle/unites-structurelles`;

  constructor(private http: HttpClient) {}

  getOrganigramme(): Observable<OrganigrammeNode[]> {
    return this.http.get<OrganigrammeNode[]>(`${this.baseUrl}/organigramme`);
  }
}
