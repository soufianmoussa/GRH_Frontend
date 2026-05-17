import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AgentModel } from '../../../../models/Agent.model';
import { environment } from '../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class GestionUtilisateursService {

  constructor(private http: HttpClient) { }



  private readonly apiUrlAgents = `${environment.apiUrl}/agents`;


  getAgents(): Observable<AgentModel[]> {
    return this.http.get<AgentModel[]>(this.apiUrlAgents);
  }

  getAgentsByUniteId(uniteId: number): Observable<AgentModel[]> {
    return this.http.get<AgentModel[]>(`${this.apiUrlAgents}/unite/${uniteId}`);
  }


  searchAgents(criteria: any): Observable<AgentModel[]> {
    return this.http.post<AgentModel[]>(`${this.apiUrlAgents}/search`, criteria);
  }


  getAgentById(id: number): Observable<AgentModel> {
    return this.http.get<AgentModel>(`${this.apiUrlAgents}/${id}`);
  }


  addAgent(data: AgentModel): Observable<AgentModel> {
    return this.http.post<AgentModel>(this.apiUrlAgents, data);
  }


  updateAgent(id: number, data: AgentModel): Observable<AgentModel> {
    return this.http.put<AgentModel>(`${this.apiUrlAgents}/${id}`, data);
  }


  deleteAgent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlAgents}/${id}`);
  }

}
