import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { DatePicker } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AgentcardComponent } from '../../shared/components/agent-card/agent-card.component';
import {
  AgentFullDto, AdresseDto, CoordonneesProfessionnellesDto,
  CoordonneesBancairesDto, EnfantDto, TypeAdresse
} from '../../models/agent-full.model';
import { DemandeModificationDto, StatutModification } from '../../models/demande-modification.model';
import { DemandeModificationService } from '../../services/demande-modification.service';

@Component({
  selector: 'app-mydata',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule, FormsModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    TableModule, TagModule, Toast,
    ButtonModule, InputTextModule, Select,
    Dialog, DatePicker, ProgressSpinnerModule,
    AgentcardComponent,
  ],
  templateUrl: './mydata.component.html',
  styleUrl: './mydata.component.scss'
})
export class MydataComponent {
  agentFull: AgentFullDto | null = null;

  // ── Edit modes ──────────────────────────────────────────────────────
  editingAdresse = false;
  editingPro = false;
  savingAdresse = false;
  savingPro = false;

  editAdresses: AdresseDto[] = [];
  editPro: CoordonneesProfessionnellesDto = {};

  typeAdresseOptions = [
    { label: 'Principale', value: 'PRINCIPALE' as TypeAdresse },
    { label: 'Secondaire', value: 'SECONDAIRE' as TypeAdresse },
    { label: 'Travail', value: 'TRAVAIL' as TypeAdresse },
    { label: 'Autre', value: 'AUTRE' as TypeAdresse },
  ];

  // ── Bancaire change request dialog ──────────────────────────────────
  showBancaireDialog = false;
  bancaireForm: CoordonneesBancairesDto = {};
  bancaireFile: File | null = null;
  submittingBancaire = false;

  // ── Enfant change request dialog ────────────────────────────────────
  showEnfantDialog = false;
  enfantForm: EnfantDto = {};
  enfantFile: File | null = null;
  submittingEnfant = false;

  sexeOptions = [
    { label: 'Masculin', value: 'M' },
    { label: 'Feminin', value: 'F' },
  ];
  situationOptions = [
    { label: 'Celibataire', value: 'C' },
    { label: 'Marie(e)', value: 'M' },
    { label: 'Veuf(ve)', value: 'V' },
    { label: 'Divorce(e)', value: 'D' },
  ];

  // ── My requests ─────────────────────────────────────────────────────
  myRequests: DemandeModificationDto[] = [];
  loadingRequests = false;

  constructor(
    private msgService: MessageService,
    private demandeService: DemandeModificationService
  ) {}

  onAgentLoaded(full: AgentFullDto): void {
    this.agentFull = full;
    this.loadMyRequests();
  }

  // ══════════════════════════════════════════════════════════════════════
  // ADRESSE — inline edit
  // ══════════════════════════════════════════════════════════════════════
  startEditAdresse(): void {
    this.editAdresses = (this.agentFull?.adresses || []).map(a => ({ ...a }));
    this.editingAdresse = true;
  }

  cancelEditAdresse(): void {
    this.editingAdresse = false;
  }

  addAdresse(): void {
    this.editAdresses.push({ type: 'AUTRE' });
  }

  removeAdresse(index: number): void {
    this.editAdresses.splice(index, 1);
  }

  saveAdresses(): void {
    this.savingAdresse = true;
    this.demandeService.updateMyAdresses(this.editAdresses).subscribe({
      next: (saved) => {
        if (this.agentFull) this.agentFull.adresses = saved;
        this.editingAdresse = false;
        this.savingAdresse = false;
        this.msgService.add({ severity: 'success', summary: 'Adresses mises a jour' });
      },
      error: (err) => {
        this.savingAdresse = false;
        this.msgService.add({
          severity: 'error', summary: 'Erreur',
          detail: err.error?.message || 'Impossible de sauvegarder les adresses'
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // PROFESSIONNEL — inline edit
  // ══════════════════════════════════════════════════════════════════════
  startEditPro(): void {
    const p = this.agentFull?.coordonneesProfessionnelles;
    this.editPro = p ? { ...p } : {};
    this.editingPro = true;
  }

  cancelEditPro(): void {
    this.editingPro = false;
  }

  savePro(): void {
    this.savingPro = true;
    this.demandeService.updateMyCoordonneesPro(this.editPro).subscribe({
      next: (saved) => {
        if (this.agentFull) this.agentFull.coordonneesProfessionnelles = saved;
        this.editingPro = false;
        this.savingPro = false;
        this.msgService.add({ severity: 'success', summary: 'Coordonnees professionnelles mises a jour' });
      },
      error: (err) => {
        this.savingPro = false;
        this.msgService.add({
          severity: 'error', summary: 'Erreur',
          detail: err.error?.message || 'Impossible de sauvegarder'
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // BANCAIRE — change request with file upload
  // ══════════════════════════════════════════════════════════════════════
  openBancaireDialog(): void {
    const b = this.agentFull?.coordonneesBancaires;
    this.bancaireForm = b ? { ...b } : {};
    this.bancaireFile = null;
    this.showBancaireDialog = true;
  }

  onBancaireFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.bancaireFile = input.files && input.files.length > 0 ? input.files[0] : null;
    input.value = '';
  }

  removeBancaireFile(): void {
    this.bancaireFile = null;
  }

  submitBancaire(): void {
    if (!this.bancaireFile) {
      this.msgService.add({ severity: 'warn', summary: 'Document requis', detail: "L'attestation de RIB est obligatoire" });
      return;
    }
    this.submittingBancaire = true;
    const payload = JSON.stringify(this.bancaireForm);
    this.demandeService.submit('BANCAIRE', payload, this.bancaireFile).subscribe({
      next: () => {
        this.showBancaireDialog = false;
        this.submittingBancaire = false;
        this.msgService.add({ severity: 'success', summary: 'Demande envoyee', detail: 'Votre demande de modification bancaire a ete soumise' });
        this.loadMyRequests();
      },
      error: (err) => {
        this.submittingBancaire = false;
        this.msgService.add({
          severity: 'error', summary: 'Erreur',
          detail: err.error?.message || 'Impossible de soumettre la demande'
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // ENFANT — change request with file upload
  // ══════════════════════════════════════════════════════════════════════
  openEnfantDialog(): void {
    this.enfantForm = {};
    this.enfantFile = null;
    this.showEnfantDialog = true;
  }

  onEnfantFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.enfantFile = input.files && input.files.length > 0 ? input.files[0] : null;
    input.value = '';
  }

  removeEnfantFile(): void {
    this.enfantFile = null;
  }

  submitEnfant(): void {
    if (!this.enfantFile) {
      this.msgService.add({ severity: 'warn', summary: 'Document requis', detail: 'Le certificat de naissance est obligatoire' });
      return;
    }
    if (!this.enfantForm.nom || !this.enfantForm.prenom) {
      this.msgService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Le nom et le prenom sont obligatoires' });
      return;
    }
    this.submittingEnfant = true;
    const payload = JSON.stringify(this.enfantForm);
    this.demandeService.submit('ENFANT', payload, this.enfantFile).subscribe({
      next: () => {
        this.showEnfantDialog = false;
        this.submittingEnfant = false;
        this.msgService.add({ severity: 'success', summary: 'Demande envoyee', detail: "Votre demande d'ajout d'enfant a ete soumise" });
        this.loadMyRequests();
      },
      error: (err) => {
        this.submittingEnfant = false;
        this.msgService.add({
          severity: 'error', summary: 'Erreur',
          detail: err.error?.message || 'Impossible de soumettre la demande'
        });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // MY REQUESTS
  // ══════════════════════════════════════════════════════════════════════
  loadMyRequests(): void {
    this.loadingRequests = true;
    this.demandeService.myRequests().subscribe({
      next: (data) => { this.myRequests = data; this.loadingRequests = false; },
      error: () => { this.loadingRequests = false; }
    });
  }

  hasPendingBancaire(): boolean {
    return this.myRequests.some(r => r.type === 'BANCAIRE' && r.statut === 'EN_ATTENTE');
  }

  hasPendingEnfant(): boolean {
    return this.myRequests.some(r => r.type === 'ENFANT' && r.statut === 'EN_ATTENTE');
  }

  // ══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════
  get situationLabel(): string {
    if (!this.agentFull?.situation) return '\u2014';
    const map: Record<string, string> = { C: 'Celibataire', M: 'Marie(e)', V: 'Veuf(ve)', D: 'Divorce(e)' };
    return map[this.agentFull.situation] || this.agentFull.situation;
  }

  typeAdresseLabel(value?: TypeAdresse): string {
    const map: Record<TypeAdresse, string> = {
      PRINCIPALE: 'Principale', SECONDAIRE: 'Secondaire', TRAVAIL: 'Travail', AUTRE: 'Autre'
    };
    return value ? map[value] : '\u2014';
  }

  typeModificationLabel(type: string): string {
    return type === 'BANCAIRE' ? 'Modification bancaire' : "Ajout d'enfant";
  }

  statutSeverity(statut: StatutModification): 'warn' | 'success' | 'danger' | 'info' {
    switch (statut) {
      case 'EN_ATTENTE': return 'warn';
      case 'APPROUVEE': return 'success';
      case 'REJETEE': return 'danger';
      default: return 'info';
    }
  }

  statutLabel(statut: StatutModification): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'APPROUVEE': return 'Approuvee';
      case 'REJETEE': return 'Rejetee';
      default: return statut;
    }
  }
}
