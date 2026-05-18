import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgentModel } from '../../../../models/Agent.model';
import { environment } from '../../../../../../environment';
import { Competence } from '../../../../models/ReferentielCompetences.model';

export interface CompetenceNotation {
  id?: number;
  agentId: number;
  agentName?: string;
  competenceId: number;
  competenceName?: string;
  notation: 'INUTILISABLE' | 'ELEMENTAIRE' | 'UTILE' | 'TRES_UTILE';
  notationLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationCompetenceService {

  private readonly apiUrlAgents = `${environment.apiUrl}/agents`;
  private readonly apiUrlCompetences = `${environment.apiUrl}/competences`;
  private readonly apiUrlNotations = `${environment.apiUrl}/competence-notations`;

  constructor(private http: HttpClient) { }


  getAgents(): Observable<AgentModel[]> {
    return this.http.get<AgentModel[]>(this.apiUrlAgents);
  }


  searchAgents(criteria: any): Observable<AgentModel[]> {
    return this.http.post<AgentModel[]>(`${this.apiUrlAgents}/search`, criteria);
  }


  getCompetences(): Observable<any> {
    return this.http.get<any>(this.apiUrlCompetences);
  }


  getNotationsByAgent(agentId: number): Observable<CompetenceNotation[]> {
    return this.http.get<CompetenceNotation[]>(`${this.apiUrlNotations}/agent/${agentId}`);
  }

  saveNotation(notation: CompetenceNotation): Observable<CompetenceNotation> {
    return this.http.post<CompetenceNotation>(this.apiUrlNotations, notation);
  }

  deleteNotation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlNotations}/${id}`);
  }
}
