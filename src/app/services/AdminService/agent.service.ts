import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgentModel } from '../../models/Agent.model';
import { StoredFileDto } from '../../models/StoredFile.model';
import { environment } from '../../../../environment.prod';

@Injectable({
    providedIn: 'root'
})
export class AgentService {

    private readonly baseUrl = `${environment.apiUrl}/agents`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<AgentModel[]> {
        return this.http.get<AgentModel[]>(this.baseUrl);
    }

    getById(id: number): Observable<AgentModel> {
        return this.http.get<AgentModel>(`${this.baseUrl}/${id}`);
    }

    search(criteria: any): Observable<AgentModel[]> {
        return this.http.post<AgentModel[]>(`${this.baseUrl}/search`, criteria);
    }

    getProfilePicture(agentId: number): Observable<StoredFileDto> {
        return this.http.get<StoredFileDto>(`${this.baseUrl}/${agentId}/profile-picture`);
    }
}
