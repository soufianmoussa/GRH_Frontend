import {Component, OnInit} from '@angular/core';
import {Button, ButtonDirective} from 'primeng/button';
import {Table, TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Dialog} from 'primeng/dialog';
import {NgIf} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import {NoteAnnuelle, PageResponse} from '../../../../models/noteAnnuelle.models';
import {NoteAnnuelleService} from '../../services/note-annuelle/note-annuelle.service';
import {Calendar} from 'primeng/calendar';

type NoteForm = {
  id?: number;
  matricule: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  noteCP: number | null;
  noteEP: number | null;
  noteComport: number | null;
};


@Component({
  selector: 'app-note-annuelles',
  imports: [
    Button,
    TableModule,
    FormsModule,
    NgIf,
    DropdownModule,
    Dialog,
    ButtonDirective,
    InputText,
    Calendar
  ],
  templateUrl: './note-annuelles.component.html',
  styleUrl: './note-annuelles.component.scss'
})
export class NoteAnnuellesComponent implements OnInit {
  loading = false;

  search = '';

  notes: NoteAnnuelle[] = [];
  totalRecords = 0;
  pageSize = 5;
  currentPage = 0;

  displayView = false;
  displayAdd = false;
  displayEdit = false;

  selected: NoteAnnuelle | null = null;
  newNote: NoteForm = this.emptyForm();
  editNote: NoteForm | null = null;

  noteList = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
  ];

  constructor(private noteService: NoteAnnuelleService) {}

  ngOnInit(): void {
    this.loadPage(0, this.pageSize);
  }

  loadPage(page: number, size: number): void {
    this.currentPage = page;
    this.pageSize = size;


    console.log("this.search");
    console.log(this.search);
    console.log("this.search");

    this.noteService.getAll(page, size, this.search).subscribe({
      next: (res: PageResponse<NoteAnnuelle>) => {
        this.notes = res?.content ?? [];
        this.totalRecords = res?.totalElements ?? 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur load notes', err);
        this.loading = false;
      },
    });
  }

  onPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows);
    const size = event.rows;
    this.loadPage(page, size);
  }

  refreshTable(): void {
    this.loadPage(this.currentPage, this.pageSize);
  }

  applySearch(): void {
    this.loadPage(0, this.pageSize);
  }

  clearTable(table: Table): void {
    table.clear();
    this.search = '';
    this.applySearch();
  }

  onView(item: NoteAnnuelle): void {
    this.selected = item;
    this.displayView = true;
  }

  showAddDialog(): void {
    this.newNote = this.emptyForm();
    this.displayAdd = true;
  }

  create(): void {
    if (!this.newNote.matricule.trim()) {
      alert('Matricule est obligatoire');
      return;
    }

    const payload: Partial<NoteAnnuelle> = {
      matricule: this.newNote.matricule.trim(),
      dateDebut: this.toIsoDate(this.newNote.dateDebut),
      dateFin: this.toIsoDate(this.newNote.dateFin),
      noteCP: this.newNote.noteCP ?? 1,
      noteEP: this.newNote.noteEP ?? 1,
      noteComport: this.newNote.noteComport ?? 1,
    };

    this.loading = true;
    this.noteService.create(payload).subscribe({
      next: () => {
        this.displayAdd = false;
        this.loading = false;
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur create note', err);
        this.loading = false;
      },
    });
  }

  onEdit(item: NoteAnnuelle): void {
    this.editNote = {
      id: item.id,
      matricule: item.matricule ?? '',
      dateDebut: this.fromIsoDate(item.dateDebut),
      dateFin: this.fromIsoDate(item.dateFin),
      noteCP: item.noteCP ?? 1,
      noteEP: item.noteEP ?? 1,
      noteComport: item.noteComport ?? 1,
    };
    this.displayEdit = true;
  }

  update(): void {
    if (!this.editNote?.id) return;

    if (!this.editNote.matricule.trim()) {
      alert('Matricule est obligatoire');
      return;
    }

    const payload: Partial<NoteAnnuelle> = {
      matricule: this.editNote.matricule.trim(),
      dateDebut: this.toIsoDate(this.editNote.dateDebut),
      dateFin: this.toIsoDate(this.editNote.dateFin),
      noteCP: this.editNote.noteCP ?? 1,
      noteEP: this.editNote.noteEP ?? 1,
      noteComport: this.editNote.noteComport ?? 1,
    };

    this.loading = true;
    this.noteService.update(this.editNote.id, payload).subscribe({
      next: () => {
        this.displayEdit = false;
        this.editNote = null;
        this.loading = false;
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur update note', err);
        this.loading = false;
      },
    });
  }

  onDelete(item: NoteAnnuelle): void {
    if (!item?.id) return;
    const ok = confirm(`Supprimer la note du matricule ${item.matricule} ?`);
    if (!ok) return;

    this.loading = true;
    this.noteService.delete(item.id).subscribe({
      next: () => {
        this.loading = false;
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur delete note', err);
        this.loading = false;
      },
    });
  }

  private emptyForm(): NoteForm {
    return {
      matricule: '',
      dateDebut: null,
      dateFin: null,
      noteCP: 1,
      noteEP: 1,
      noteComport: 1,
    };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
