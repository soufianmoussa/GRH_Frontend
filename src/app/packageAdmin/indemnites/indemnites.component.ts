import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {Button, ButtonDirective} from "primeng/button";
import {Dialog} from "primeng/dialog";
import {InputText} from "primeng/inputtext";
import {NgIf, CommonModule} from "@angular/common";
import {PrimeTemplate, MessageService, ConfirmationService} from "primeng/api";
import {FormsModule, ReactiveFormsModule, NgForm} from "@angular/forms";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "primeng/tabs";
import {TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {DatePicker} from 'primeng/datepicker';
import {Toast} from 'primeng/toast';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {FloatLabelModule} from 'primeng/floatlabel';
import {Select} from 'primeng/select';
import {IndemnitesService} from '../../services/AdminService/indemnites/indemnites.service';
import {AgentService} from '../../services/AdminService/agent.service';
import {IndemnitePermanente} from '../../models/indemnitesModel.model';
import {ToastHelper} from '../../shared/toast-helper';

@Component({
  selector: 'app-indemnites',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    Button,
    ButtonDirective,
    Dialog,
    InputText,
    NgIf,
    PrimeTemplate,
    ReactiveFormsModule,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    TableModule,
    Tabs,
    TooltipModule,
    FormsModule,
    DatePicker,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    Select
  ],
  templateUrl: './indemnites.component.html',
  styleUrl: './indemnites.component.scss'
})
export class IndemnitesComponent implements OnInit {

  constructor(
    private indemnitesService: IndemnitesService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  indemnitesComplementairesData : any[] = [];
  IndemnitesPermanentesData : any[] = [];
  agents: any[] = [];
  loading = false;
  searchValue = '';

  ngOnInit(): void {
    this.loadAgents();
    this.initializeData();
  }

  loadAgents() {
    this.agentService.getAll().subscribe({
      next: (res) => this.agents = res || [],
      error: (err) => console.error('Error fetching agents:', err)
    });
  }

  initializeData() {
    this.loading = true;
    this.indemnitesService.getIndemnitesComplementaires().subscribe({
      next: (res) => {
        this.indemnitesComplementairesData = res || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error in IndemnitesComplementaires:', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      }
    });

    this.indemnitesService.getIndemnitesPermanentes().subscribe({
      next: (res) => {
        this.IndemnitesPermanentesData = res || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error in IndemnitesPermanentes:', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      }
    });
  }

  clear(table: any) {
    this.searchValue = '';
    table.clear();
    this.applySearch();
  }

  applySearch() {
    this.initializeData();
  }

  selectedCompl: any = null;
  selectedPerm: any = null;
  displayCompl = false;
  displayPerm = false;

  viewCompl(item: any) {
    this.selectedCompl = item;
    this.displayCompl = true;
  }

  viewPerm(item: any) {
    this.selectedPerm = item;
    this.displayPerm = true;
  }

  displayAddCompl = false;
  displayAddPerm = false;

  newCompl: any = this.emptyComplForm();
  newPerm: any = this.emptyPermForm();
  @ViewChild('addComplForm') addComplForm?: NgForm;
  @ViewChild('addPermForm') addPermForm?: NgForm;

  showAddComplDialog() {
    this.newCompl = this.emptyComplForm();
    this.displayAddCompl = true;
    setTimeout(() => {
      this.addComplForm?.resetForm(this.newCompl);
    });
  }

  showAddPermDialog() {
    this.newPerm = this.emptyPermForm();
    this.displayAddPerm = true;
    setTimeout(() => {
      this.addPermForm?.resetForm(this.newPerm);
    });
  }

  addCompl() {
    if (!this.newCompl.agentId || !this.newCompl.rubrique?.trim() || !this.newCompl.montantRubrique ||
        !this.newCompl.nombre || !this.newCompl.dateOrigine || !this.newCompl.uniteTempsMesure?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.newCompl,
      dateOrigine: this.toIsoDate(this.newCompl.dateOrigine)
    };

    this.indemnitesService.addIndemniteComplementaire(payload).subscribe({
      next: () => {
        ToastHelper.showAdd(this.messageService);
        this.displayAddCompl = false;
        this.initializeData();
      },
      error: err => ToastHelper.showAddError(this.messageService, err?.error?.message)
    });
  }

  addPerm() {
    if (!this.newPerm.agentId || !this.newPerm.rubrique?.trim() || !this.newPerm.montantRubrique ||
        !this.newPerm.dateDebutAttribution || !this.newPerm.dateFinAttribution ||
        !this.newPerm.nombreTaux || !this.newPerm.uniteTempsMesure?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.newPerm,
      dateDebutAttribution: this.toIsoDate(this.newPerm.dateDebutAttribution),
      dateFinAttribution: this.toIsoDate(this.newPerm.dateFinAttribution)
    };

    this.indemnitesService.addIndemnitePermanente(payload).subscribe({
      next: () => {
        ToastHelper.showAdd(this.messageService);
        this.displayAddPerm = false;
        this.initializeData();
      },
      error: err => ToastHelper.showAddError(this.messageService, err?.error?.message)
    });
  }

  displayEditCompl = false;
  displayEditPerm = false;
  editCompl: any = null;
  editPerm: any = null;
  @ViewChild('editComplForm') editComplForm?: NgForm;
  @ViewChild('editPermForm') editPermForm?: NgForm;

  onEditCompl(item: any) {
    this.editCompl = {
      ...item,
      dateOrigine: this.fromIsoDate(item.dateOrigine)
    };
    this.displayEditCompl = true;
    setTimeout(() => {
      this.editComplForm?.resetForm(this.editCompl);
    });
  }

  updateCompl() {
    if (!this.editCompl?.id) return;
    if (!this.editCompl.agentId || !this.editCompl.rubrique?.trim() || !this.editCompl.montantRubrique ||
        !this.editCompl.nombre || !this.editCompl.dateOrigine || !this.editCompl.uniteTempsMesure?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.editCompl,
      dateOrigine: this.toIsoDate(this.editCompl.dateOrigine)
    };

    this.indemnitesService.updateIndemniteComplementaire(this.editCompl.id, payload).subscribe({
      next: () => {
        ToastHelper.showEdit(this.messageService);
        this.displayEditCompl = false;
        this.initializeData();
      },
      error: err => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
    });
  }

  onEditPerm(item: IndemnitePermanente) {
    this.editPerm = {
      ...item,
      dateDebutAttribution: this.fromIsoDate(item.dateDebutAttribution),
      dateFinAttribution: this.fromIsoDate(item.dateFinAttribution)
    };
    this.displayEditPerm = true;
    setTimeout(() => {
      this.editPermForm?.resetForm(this.editPerm);
    });
  }

  updatePerm() {
    if (!this.editPerm?.id) return;
    if (!this.editPerm.agentId || !this.editPerm.rubrique?.trim() || !this.editPerm.montantRubrique ||
        !this.editPerm.dateDebutAttribution || !this.editPerm.dateFinAttribution ||
        !this.editPerm.nombreTaux || !this.editPerm.uniteTempsMesure?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.editPerm,
      dateDebutAttribution: this.toIsoDate(this.editPerm.dateDebutAttribution),
      dateFinAttribution: this.toIsoDate(this.editPerm.dateFinAttribution)
    };

    this.indemnitesService.updateIndemnitePermanente(this.editPerm.id, payload).subscribe({
      next: () => {
        ToastHelper.showEdit(this.messageService);
        this.displayEditPerm = false;
        this.initializeData();
      },
      error: err => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
    });
  }

  deleteCompl(id : any) {
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.indemnitesService.deleteIndemniteComplementaire(id).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.initializeData();
        },
        error: err => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    });
  }

  deletePerm(id : any) {
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.indemnitesService.deleteIndemnitePermanente(id).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.initializeData();
        },
        error: err => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    });
  }

  private emptyComplForm() {
    return { agentId: null, rubrique: '', montantRubrique: '', nombre: '', uniteTempsMesure: '', dateOrigine: null };
  }

  private emptyPermForm() {
    return { agentId: null, dateDebutAttribution: null, dateFinAttribution: null, rubrique: '', montantRubrique: '', nombreTaux: '', uniteTempsMesure: '' };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d || !(d instanceof Date)) return d as any;
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
