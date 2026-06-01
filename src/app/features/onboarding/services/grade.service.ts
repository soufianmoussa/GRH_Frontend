import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { PageResponse } from '../../../models/PageResponse.model';
import { Grade } from '../../../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private readonly baseUrl = `${environment.apiUrl}/grades`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 500): Observable<Grade[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<Grade> | Grade[]>(this.baseUrl, { params }).pipe(
      map(response => Array.isArray(response) ? response : response.content)
    );
  }
}
