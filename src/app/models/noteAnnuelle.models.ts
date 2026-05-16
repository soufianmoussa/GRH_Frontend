export interface NoteAnnuelle {
  id?: number;
  matricule: string;
  dateDebut: string | null;
  dateFin: string | null;
  noteCP: number | null;
  noteEP: number | null;
  noteComport: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
