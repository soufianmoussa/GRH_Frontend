import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { PageResponse } from '../../../models/PageResponse.model';
import { EchelleReferential } from '../../../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class EchelleService {
  private readonly baseUrl = `${environment.apiUrl}/echelles`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 100): Observable<EchelleReferential[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<EchelleReferential> | EchelleReferential[]>(this.baseUrl, { params }).pipe(
      map(response => Array.isArray(response) ? response : response.content)
    );
  }
}
