import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { PosteOption } from '../../../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class PosteOnboardingService {
  private readonly baseUrl = `${environment.apiUrl}/gestion-organisationelle/postes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PosteOption[]> {
    return this.http.get<PosteOption[]>(`${this.baseUrl}/all`);
  }
}
