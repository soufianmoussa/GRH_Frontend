import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { JourFerie, JourFerieCreateUpdateRequest } from '../../../../models/jourFerie.model';
import { environment } from '../../../../../../environment.prod';

/** Public-holidays response from the Nager.Date open API. */
export interface NagerPublicHoliday {
  date: string;          // YYYY-MM-DD
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

@Injectable({
  providedIn: 'root'
})
export class JourFerieService {

  private readonly baseUrl = `${environment.apiUrl}/jours-feries`;
  private readonly nagerUrl = 'https://date.nager.at/api/v3/PublicHolidays';

  constructor(private http: HttpClient) {}

  getAll(year?: number): Observable<JourFerie[]> {
    let params = new HttpParams();
    if (year != null) {
      params = params.set('year', year);
    }
    return this.http.get<JourFerie[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<JourFerie> {
    return this.http.get<JourFerie>(`${this.baseUrl}/${id}`);
  }

  create(payload: JourFerieCreateUpdateRequest): Observable<JourFerie> {
    return this.http.post<JourFerie>(this.baseUrl, payload);
  }

  update(id: number, payload: JourFerieCreateUpdateRequest): Observable<JourFerie> {
    return this.http.put<JourFerie>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Fetch official public holidays for a given year/country from the Nager.Date API.
   * Uses native fetch to bypass our auth interceptor (the public API rejects the preflight
   * triggered by an Authorization header).
   */
  fetchPublicHolidays(year: number, countryCode: string = 'MA'): Observable<NagerPublicHoliday[]> {
    const url = `${this.nagerUrl}/${year}/${countryCode}`;
    return from(
      fetch(url).then(r => {
        if (!r.ok) throw new Error(`Nager.Date API error: ${r.status}`);
        return r.json() as Promise<NagerPublicHoliday[]>;
      })
    );
  }
}
