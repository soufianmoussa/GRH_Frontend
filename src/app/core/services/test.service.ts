import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  private apiUrl = `${environment.apiUrl}/activites`;

  constructor(private http: HttpClient) {}

  getTest(): Observable<any> {
    return this.http.get<Observable<any>>(this.apiUrl);
  }

}
