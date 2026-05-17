import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environment.prod';
import { Matricule } from '../../../../models/initialisation-matricules.model';
import { AgentCreateRequest, AgentFullDto, AgentTravailDto } from '../../../../models/agent-full.model';

/**
 * Service HTTP du workflow "Dossiers agents" (wizard).
 * Utilise les endpoints /full ajoutés côté backend.
 */
@Injectable({ providedIn: 'root' })
export class DossiersAgentsService {
  private readonly apiAgents = `${environment.apiUrl}/agents`;
  private readonly apiMatricules = `${environment.apiUrl}/matricules`;

  constructor(private http: HttpClient) {}

  getAvailableMatricules(): Observable<Matricule[]> {
    return this.http.get<Matricule[]>(`${this.apiMatricules}/available`);
  }

  createFull(payload: AgentCreateRequest): Observable<AgentFullDto> {
    return this.http.post<AgentFullDto>(`${this.apiAgents}/full`, payload);
  }

  updateFull(agentId: number, payload: AgentCreateRequest): Observable<AgentFullDto> {
    return this.http.put<AgentFullDto>(`${this.apiAgents}/${agentId}/full`, payload);
  }

  getFull(agentId: number): Observable<AgentFullDto> {
    return this.http.get<AgentFullDto>(`${this.apiAgents}/${agentId}/full`);
  }

  getTravail(agentId: number): Observable<AgentTravailDto> {
    return this.http.get<AgentTravailDto>(`${this.apiAgents}/${agentId}/travail`);
  }

  canDelete(agentId: number): Observable<{ canDelete: boolean; reason: string }> {
    return this.http.get<{ canDelete: boolean; reason: string }>(`${this.apiAgents}/${agentId}/can-delete`);
  }

  uploadProfilePicture(agentId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiAgents}/${agentId}/profile-picture`, formData);
  }
}
