import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Table, TableModule} from 'primeng/table';
import {Button, ButtonDirective} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {FormsModule, NgForm} from '@angular/forms';
import {Dialog} from 'primeng/dialog';
import {NgIf} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import { PretFinancier} from '../../models/prets-financiers.model';
import {PretsFinanciersService} from '../../services/AdminService/prets-financiers/prets-financiers.service';
import {AgentService} from '../../services/AdminService/agent.service';
import {AgentModel} from '../../models/Agent.model';
import {Select} from 'primeng/select';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {TooltipModule} from 'primeng/tooltip';
import {PageResponse} from '../../models/PageResponse.model';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../shared/utils/toast-helper';
import {DatePicker} from 'primeng/datepicker';

@Component({
  selector: 'app-pret-financier',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    Button,
    InputText,
    FormsModule,
    ButtonDirective,
    Dialog,
    NgIf,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    TooltipModule,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    PrimeTemplate,
    DatePicker,
    Select,
    DropdownModule
  ],
  templateUrl: './pret-financier.component.html',
  styleUrl: './pret-financier.component.scss'
})
export class PretFinancierComponent implements OnInit {
  loading = false;
  agents: AgentModel[] = [];

  prets: PretFinancier[] = [];
  searchPret = '';

  displayDialogPret = false;
  displayAddPret = false;
  displayEditPret = false;

  selectedPret: PretFinancier | null = null;

  newPret: Partial<PretFinancier> = this.emptyForm();
  editPret: PretFinancier | null = null;
  @ViewChild('addForm') addForm?: NgForm;
  @ViewChild('editForm') editForm?: NgForm;

  typePretOptions = [
    { label: 'Prêts onéreux', value: 'Prêts onéreux' },
    { label: 'Prêts sociaux', value: 'Prêts sociaux' },
    { label: 'Prêt « Aid Al Adha »', value: 'Prêt « Aid Al Adha »' },
    { label: 'Secours', value: 'Secours' }
  ];

  conditionsOptions = [
    { label: 'Echelle 1 à 7', value: '90000DH' },
    { label: 'Echelle 8 et 9', value: '120000DH' },
    { label: 'Echelle 10 et 11', value: '150000DH' },
    { label: 'Hors échelle', value: '200000DH' }
  ];

  constructor(
    private pretsService: PretsFinanciersService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadPrets();
  }

  loadAgents(): void {
    this.agentService.getAll().subscribe({
      next: (res: AgentModel[]) => this.agents = res || [],
      error: (err: any) => console.error('Error fetching agents:', err)
    });
  }

  loadPrets(page = 0, size = 200) {
    this.loading = true;
    this.pretsService.getAll(page, size,this.searchPret).subscribe({
      next: (res: PageResponse<PretFinancier>) => {
        this.prets = res?.content ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading prets:', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      }
    });
  }

  applySearch() {
    this.loadPrets();
  }

  clearPret(table: Table) {
    this.searchPret = '';
    table.clear();
    this.applySearch();
  }

  onViewPret(item: PretFinancier) {
    this.selectedPret = {
      ...item,
      dateOctroi: this.fromIsoDate(item.dateOctroi) as any,
      dateFin: this.fromIsoDate(item.dateFin) as any
    };
    this.displayDialogPret = true;
  }

  showAddPretDialog() {
    this.newPret = this.emptyForm();
    this.displayAddPret = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newPret);
    });
  }

  addPret() {
    if (!this.newPret.agentId || !this.newPret.typePret?.trim() || !this.newPret.conditions?.trim() ||
        !this.newPret.numeroDossier?.trim() || !this.newPret.dateOctroi || !this.newPret.dateFin || this.newPret.montant === undefined) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.newPret,
      dateOctroi: this.toIsoDate(this.newPret.dateOctroi as any),
      dateFin: this.toIsoDate(this.newPret.dateFin as any)
    };

    this.pretsService.add(payload).subscribe({
      next: () => {
        this.displayAddPret = false;
        ToastHelper.showAdd(this.messageService);
        this.loadPrets();
      },
      error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
    });
  }

  onEditPret(item: PretFinancier) {
    this.editPret = {
      ...item,
      dateOctroi: this.fromIsoDate(item.dateOctroi) as any,
      dateFin: this.fromIsoDate(item.dateFin) as any
    };
    this.displayEditPret = true;
    setTimeout(() => {
      this.editForm?.resetForm(this.editPret);
    });
  }

  updatePret() {
    if (!this.editPret?.id) return;
    if (!this.editPret.agentId || !this.editPret.typePret?.trim() || !this.editPret.conditions?.trim() ||
        !this.editPret.numeroDossier?.trim() || !this.editPret.dateOctroi || !this.editPret.dateFin || this.editPret.montant === undefined) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.editPret,
      dateOctroi: this.toIsoDate(this.editPret.dateOctroi as any),
      dateFin: this.toIsoDate(this.editPret.dateFin as any)
    };

    this.pretsService.update(this.editPret.id, payload).subscribe({
      next: () => {
        this.displayEditPret = false;
        this.editPret = null;
        ToastHelper.showEdit(this.messageService);
        this.loadPrets();
      },
      error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
    });
  }

  deletePret(item: PretFinancier) {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.pretsService.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadPrets();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer le prêt n°${item.numeroDossier} pour l'agent ${item.agentMatricule} ?`);
  }

  private emptyForm() {
    return {
      agentId: undefined,
      typePret: '',
      conditions: '',
      numeroDossier: '',
      dateOctroi: undefined,
      dateFin: undefined,
      montant: 0,
      mensualite: 0,
      taux: 0
    };
  }

  private toIsoDate(d: Date | null | undefined): string | undefined {
    if (!d || !(d instanceof Date)) return undefined;
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
