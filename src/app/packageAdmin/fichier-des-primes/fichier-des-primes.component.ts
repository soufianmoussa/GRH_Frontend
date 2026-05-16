import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Table, TableModule} from 'primeng/table';
import {Button, ButtonDirective} from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
import {Dialog} from 'primeng/dialog';
import {TooltipModule} from 'primeng/tooltip';
import {Prime} from '../../models/primes.model';
import {PrimesService} from '../../services/AdminService/Primes/primes.service';
import {DatePicker} from 'primeng/datepicker';
import {Toast} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {FloatLabelModule} from 'primeng/floatlabel';
import {ToastHelper} from '../../shared/toast-helper';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { DropdownModule } from 'primeng/dropdown';
import { AgentService } from '../../services/AdminService/agent.service';
import { AgentModel } from '../../models/Agent.model';

@Component({
  selector: 'app-fichier-primes',
  standalone: true,
  providers: [ConfirmationService, MessageService],
  imports: [
    CommonModule,
    TableModule,
    Button,
    InputText,
    FormsModule,
    PrimeTemplate,
    Dialog,
    ButtonDirective,
    TooltipModule,
    DatePicker,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    DropdownModule
  ],
  templateUrl: './fichier-des-primes.component.html',
  styleUrl: './fichier-des-primes.component.scss',
})
export class FichierDesPrimesComponent implements OnInit {
  primes: Prime[] = [];
  loading = true;
  searchValue = '';

  displayView = false;
  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  selectedPrime: Prime | null = null;
  formPrime: any = {};
  @ViewChild('addForm') addForm?: NgForm;

  agents: AgentModel[] = [];

  constructor(
    private primesService: PrimesService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.agentService.getAll().subscribe(res => this.agents = res);
    this.loadPrimes();
  }

  loadPrimes() {
    this.loading = true;
    this.primesService.getAll(0, 500).subscribe({
      next: (res) => {
        this.primes = res?.content ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading primes:', err);
        this.primes = [];
        this.loading = false;
        ToastHelper.showLoadError(this.messageService);
      }
    });
  }

  applySearch(): void {
    this.loadPrimes();
  }

  clearTable(table: Table) {
    this.searchValue = '';
    table.clear();
    this.applySearch();
  }

  onView(prime: Prime) {
    this.selectedPrime = prime;
    this.displayView = true;
  }

  showAddPrime() {
    this.dialogMode = 'add';
    this.formPrime = {
      primeBase: 0,
      primeResponsabilite: 0,
      primeComplementaire: 0,
      primeForfaitaire: 0,
      primeFinCarriere: 0,
      montantPrimeNette: 0,
      montantPrimeBrute: 0,
      temoinGeneral: 'O'
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.formPrime);
    });
  }

  onEdit(prime: Prime) {
    this.dialogMode = 'edit';
    this.formPrime = {
      ...prime,
      dateDebut: this.fromIsoDate(prime.dateDebut) as any,
      dateFin: this.fromIsoDate(prime.dateFin) as any
    };
    this.displayDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.formPrime);
    });
  }

  savePrime() {
    const p = this.formPrime;
    if (!p.agentId || !p.dateDebut || !p.dateFin ||
        !p.codeCentre?.trim() || p.primeBase == null ||
        p.primeResponsabilite == null || p.primeComplementaire == null) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<Prime> = {
      ...this.formPrime,
      agentId: p.agentId,
      codeCentre: p.codeCentre.trim(),
      dateDebut: this.toIsoDate(this.formPrime.dateDebut as any) as any,
      dateFin: this.toIsoDate(this.formPrime.dateFin as any) as any
    };

    if (this.dialogMode === 'add') {
      this.primesService.add(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showAdd(this.messageService);
          this.loadPrimes();
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      if (!p.id) return;
      this.primesService.update(p.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showEdit(this.messageService);
          this.loadPrimes();
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDelete(prime: Prime) {
    if (!prime.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.primesService.delete(prime.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadPrimes();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Delete prime failed:', err);
          ToastHelper.showDeleteError(this.messageService, err?.error?.message);
        }
      });
    }, `Supprimer cette prime ?`);
  }

  private toIsoDate(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
