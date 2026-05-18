import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';

export interface ChartData {
  label: string;
  value: number;
}

export interface RecentActe {
  matricule: string;
  typeDemande: string;
  dateAffectation: string;
}

export interface DashboardDto {
  totalAgents: number;
  postesOccupes: number;
  congesEnCours: number;
  accidentsMaladies: number;
  congesChartData: ChartData[];
  echellesChartData: ChartData[];
  derniersActes: RecentActe[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardDto> {
    return this.http.get<DashboardDto>(`${this.apiUrl}/stats`);
  }
}
