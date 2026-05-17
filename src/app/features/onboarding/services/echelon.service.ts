import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { PageResponse } from '../../../models/PageResponse.model';
import { EchelonReferential } from '../../../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class EchelonService {
  private readonly baseUrl = `${environment.apiUrl}/echelons`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200): Observable<EchelonReferential[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<EchelonReferential> | EchelonReferential[]>(this.baseUrl, { params }).pipe(
      map(response => Array.isArray(response) ? response : response.content)
    );
  }
}
