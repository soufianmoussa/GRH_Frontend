import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  private apiUrl = 'http://localhost:8080/api/activites';

  constructor(private http: HttpClient) {}

  getTest(): Observable<any> {
    return this.http.get<Observable<any>>(this.apiUrl);
  }

}
