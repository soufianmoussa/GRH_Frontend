import {Component, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {NgClass} from '@angular/common';
import {PrimeTemplate} from 'primeng/api';
import {FormsModule} from '@angular/forms';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {Table, TableModule} from 'primeng/table';
import {DemandeAttestation, DemandeConge, PageResponse} from '../../models/demandes.model';
import {DemandesCongeService} from '../../services/ResponsableUnite/Demandes/demandes-conge.service';
import {DemandesAttestationService} from '../../services/ResponsableUnite/Demandes/demandes-attestation.service';

@Component({
  selector: 'app-demandes-conge-attestation',
  imports: [
    Button,

    InputText,

    PrimeTemplate,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    TableModule,

    FormsModule,
    NgClass
  ],
  templateUrl: './demandes-conge-attestation.component.html',
  styleUrl: './demandes-conge-attestation.component.scss'
})
export class DemandesCongeAttestationComponent implements OnInit {

  searchConge = '';
  searchAttest = '';

  demandesConge: DemandeConge[] = [];
  demandesAttestation: DemandeAttestation[] = [];

  loadingConge = false;
  loadingAttest = false;

  totalConge = 0;
  pageSizeConge = 5;
  currentPageConge = 0;

  totalAttest = 0;
  pageSizeAttest = 5;
  currentPageAttest = 0;

  constructor(
    private congeService: DemandesCongeService,
    private attestService: DemandesAttestationService
  ) {}

  ngOnInit(): void {
    this.loadConge(0, this.pageSizeConge);
    this.loadAttestation(0, this.pageSizeAttest);
  }

  loadConge(page: number, size: number) {
    this.currentPageConge = page;
    this.pageSizeConge = size;

    this.congeService.getAll(page, size, this.searchConge).subscribe({
      next: (res: PageResponse<DemandeConge>) => {
        this.demandesConge = res.content ?? [];
        this.totalConge = res.totalElements ?? 0;
        this.loadingConge = false;
      },
      error: (err) => {
        console.error('Erreur load conge', err);
        this.loadingConge = false;
      }
    });
  }

  onPageConge(event: any) {
    const page = Math.floor(event.first / event.rows);
    this.loadConge(page, event.rows);
  }

  refreshConge() {
    this.loadConge(this.currentPageConge, this.pageSizeConge);
  }

  applySearchConge() {
    this.loadConge(0, this.pageSizeConge);
  }

  loadAttestation(page: number, size: number) {
    this.currentPageAttest = page;
    this.pageSizeAttest = size;

    console.log("hhaahahah");
    console.log(this.searchAttest);
    console.log("hhaahahah");

    this.attestService.getAll(page, size, this.searchAttest).subscribe({
      next: (res: PageResponse<DemandeAttestation>) => {
        this.demandesAttestation = res.content ?? [];
        this.totalAttest = res.totalElements ?? 0;
        this.loadingAttest = false;
      },
      error: (err) => {
        console.error('Erreur load attestation', err);
        this.loadingAttest = false;
      }
    });
  }

  onPageAttest(event: any) {
    const page = Math.floor(event.first / event.rows);
    this.loadAttestation(page, event.rows);
  }

  refreshAttest() {
    this.loadAttestation(this.currentPageAttest, this.pageSizeAttest);
  }

  applySearchAttest() {
    this.loadAttestation(0, this.pageSizeAttest);
  }

  clear(table: Table) {
    table.clear();
    this.searchConge = '';
    this.searchAttest = '';
    this.applySearchAttest();
    this.applySearchConge();
    this.refreshConge();
    this.refreshAttest();
  }

  getStatusClass(statut: string) {
    switch (statut) {
      case 'En attente':
        return 'badge waiting';
      case 'Approuvé':
      case 'Validée':
        return 'badge success';
      case 'Rejetée':
        return 'badge danger';
      case 'Traitée':
        return 'badge info';
      default:
        return 'badge neutral';
    }
  }

}
