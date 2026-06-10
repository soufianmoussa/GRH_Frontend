import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SanctionService } from '../../../services/sanction/sanction.service';
import { Sanction, EnumOption } from '../../../../../models/Sanction.model';
import { ActStatus, ACT_STATUS_SEVERITY } from '../../../../../enums/ActStatus';

/** Liste des sanctions : filtres avancés, badges de statut, actions par ligne. */
@Component({
  selector: 'app-sanction-list',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Select, DatePicker,
    InputTextModule, TagModule, Toast, ConfirmDialogModule, TooltipModule
  ],
  templateUrl: './sanction-list.component.html',
  styleUrl: './sanction-list.component.scss'
})
export class SanctionListComponent implements OnInit {

  sanctions: Sanction[] = [];
  loading = false;

  // Filtres
  global = '';
  status: string | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  statusOptions: EnumOption[] = [];
  readonly ActStatus = ActStatus;
  readonly severity = ACT_STATUS_SEVERITY;

  constructor(
    private service: SanctionService,
    private router: Router,
    private messageService: MessageService,
    private confirm: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.service.getStatuses().subscribe({ next: r => this.statusOptions = r });
    this.load();
  }

  load(): void {
    this.loading = true;
    const criteria: any = {
      global: this.global?.trim() || null,
      status: this.status,
      dateEffetFrom: this.dateFrom ? this.toIso(this.dateFrom) : null,
      dateEffetTo: this.dateTo ? this.toIso(this.dateTo) : null,
    };
    this.service.search(criteria).subscribe({
      next: res => { this.sanctions = res; this.loading = false; },
      error: () => { this.loading = false; this.toast('error', 'Erreur', 'Chargement impossible.'); }
    });
  }

  resetFilters(): void {
    this.global = ''; this.status = null; this.dateFrom = null; this.dateTo = null;
    this.load();
  }

  create(): void { this.router.navigate(['/admin/actes/sanctions/new']); }
  view(s: Sanction): void { this.router.navigate(['/admin/actes/sanctions', s.id]); }
  edit(s: Sanction, e: Event): void { e.stopPropagation(); this.router.navigate(['/admin/actes/sanctions', s.id, 'edit']); }

  isDraft(s: Sanction): boolean { return s.status === ActStatus.BROUILLON; }

  remove(s: Sanction, e: Event): void {
    e.stopPropagation();
    this.confirm.confirm({
      message: `Supprimer le brouillon ${s.numeroDecision} ?`,
      header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui', rejectLabel: 'Non', acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.service.delete(s.id).subscribe({
        next: () => { this.toast('success', 'Supprimé', 'Brouillon supprimé.'); this.load(); },
        error: err => this.toast('error', 'Erreur', err.error?.message || 'Suppression impossible.')
      })
    });
  }

  private toIso(d: Date): string { return d.toISOString().substring(0, 10); }

  private toast(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: severity === 'success' ? 3000 : 5000 });
  }
}
