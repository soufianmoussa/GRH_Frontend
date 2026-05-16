import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment.prod';
import {
  AgentDocument,
  AgentDocumentCreateUpdateRequest,
} from '../../../models/agent-document.model';

@Injectable({ providedIn: 'root' })
export class AgentDocumentsService {
  private readonly baseUrl = `${environment.apiUrl}/agent-documents`;

  constructor(private http: HttpClient) {}

  getByAgent(agentId: number): Observable<AgentDocument[]> {
    return this.http.get<AgentDocument[]>(`${this.baseUrl}/by-agent/${agentId}`);
  }

  getById(id: number): Observable<AgentDocument> {
    return this.http.get<AgentDocument>(`${this.baseUrl}/${id}`);
  }

  create(payload: AgentDocumentCreateUpdateRequest): Observable<AgentDocument> {
    return this.http.post<AgentDocument>(this.baseUrl, payload);
  }

  update(id: number, payload: AgentDocumentCreateUpdateRequest): Observable<AgentDocument> {
    return this.http.put<AgentDocument>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadFile(id: number, file: File): Observable<AgentDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AgentDocument>(`${this.baseUrl}/${id}/file`, formData);
  }

  deleteFile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/file`);
  }
}
