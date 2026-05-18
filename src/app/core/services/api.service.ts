import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CongeAbsence } from '../../features/conges/pages/conge/conge.component';
import { PosteDTO } from '../../features/gestion-organisationnelle/pages/gestion-organisationnelle/postes/postes.component';
import { environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly BASE_URL = `${environment.apiUrl}/accidents-maladie`;

  constructor(private http: HttpClient) { }


  searchAccidentMaladie(criteria: any, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.post(`${this.BASE_URL}/search`, criteria, { params });
  }
  private MATERNITE_URL = `${environment.apiUrl}/conges-maternite`;


















  private readonly CongeAbsence_URL = `${environment.apiUrl}/conges-absence`;



  getAll(): Observable<CongeAbsence[]> {
    return this.http.get<CongeAbsence[]>(this.CongeAbsence_URL);
  }

  getById(id: number): Observable<CongeAbsence> {
    return this.http.get<CongeAbsence>(`${this.CongeAbsence_URL}/${id}`);
  }

  create(conge: CongeAbsence): Observable<CongeAbsence> {
    return this.http.post<CongeAbsence>(this.CongeAbsence_URL, conge);
  }

  update(id: number, conge: CongeAbsence): Observable<CongeAbsence> {
    return this.http.put<CongeAbsence>(`${this.CongeAbsence_URL}/${id}`, conge);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.CongeAbsence_URL}/${id}`);
  }

  search(criteria: any, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.post(`${this.CongeAbsence_URL}/search`, criteria, { params });
  }

  private readonly API =
    `${environment.apiUrl}/gestion-organisationnelle/unites-structurelles`;


  searchUnitesStructurelles(code: string): Observable<any> {
    return this.http.get<any>(`${this.API}/search?code=${code}`);
  }





  createUnitesStructurelles(payload: any) {
    return this.http.post<any>(`${this.API}/create-with-liaison`, payload);
  }

  updateUnitesStructurelles(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.API}/${id}`, payload);
  }

  deleteUnitesStructurelles(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  private readonly Poste_URL = `${environment.apiUrl}/gestion-organisationnelle/postes`;


  getAllPoste(): Observable<PosteDTO[]> {
    return this.http.get<PosteDTO[]>(this.Poste_URL);
  }

  getByIdPoste(id: number): Observable<PosteDTO> {
    return this.http.get<PosteDTO>(`${this.Poste_URL}/search/poste?id=${id}`);
  }

  createPoste(poste: PosteDTO): Observable<PosteDTO> {
    return this.http.post<PosteDTO>(this.Poste_URL, poste);
  }

  updatePoste(id: number, poste: PosteDTO): Observable<PosteDTO> {
    const payload = {
      poste: poste,
      tuteurs: [],
      unites: []
    };

    return this.http.put<PosteDTO>(
      `${this.Poste_URL}/update/${id}`,
      payload
    );
  }


  deletePoste(id: number): Observable<void> {
    return this.http.delete<void>(`${this.Poste_URL}/${id}`);
  }

  searchPoste(criteria: any, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.post(`${this.BASE_URL}/search`, criteria, { params });
  }


  private readonly FONCTION_URL = `${environment.apiUrl}/gestion-organisationnelle/fonctions`;

  getAllFonctions() {
    return this.http.get<any[]>(this.FONCTION_URL);
  }

  addFonction(fonction: any) {
    return this.http.post<any>(this.FONCTION_URL, fonction);
  }

  updateFonction(id: number, fonction: any) {
    return this.http.put<any>(`${this.FONCTION_URL}/${id}`, fonction);
  }

  deleteFonction(id: number) {
    return this.http.delete<void>(`${this.FONCTION_URL}/${id}`);
  }






}
