import {Component, OnInit, ViewChild} from '@angular/core';
import {Select} from 'primeng/select';
import {DropdownModule} from 'primeng/dropdown';
import {InputText} from 'primeng/inputtext';
import {Button, ButtonDirective} from 'primeng/button';
import {FormsModule, ReactiveFormsModule, NgForm} from '@angular/forms';
import {Table, TableModule} from 'primeng/table';
import {Dialog} from 'primeng/dialog';
import {NgIf, CommonModule} from '@angular/common';
import {RadioButton} from 'primeng/radiobutton';
import {ServiceAnterieur} from '../../models/services-anterieurs.model';
import {ServicesAnterieursService} from '../../services/AdminService/services-anterieurs/services-anterieurs.service';
import {AgentModel} from '../../models/Agent.model';
import {AgentService} from '../../services/AdminService/agent.service';
import {DatePicker} from 'primeng/datepicker';
import {PageResponse} from '../../models/PageResponse.model';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { ToastHelper } from '../../shared/toast-helper';

type ServiceForm = {
  id?: number;
  agentId?: number;

  dateDebut: Date | null;
  finValidite: Date | null;

  localite: string;
  codePays: string;

  activite: string;
  typeContrat: string;
  serviceValidable: string;
  grade: string;
};

@Component({
  selector: 'app-services-anterieurs',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    Select,
    DropdownModule,
    InputText,
    Button,
    ReactiveFormsModule,
    TableModule,
    ButtonDirective,
    Dialog,
    NgIf,
    DatePicker,
    TooltipModule,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    PrimeTemplate,
    FormsModule
  ],
  templateUrl: './services-anterieurs.component.html',
  styleUrl: './services-anterieurs.component.scss'
})
export class ServicesAnterieursComponent implements OnInit {
  services: ServiceAnterieur[] = [];
  agents: AgentModel[] = [];
  loading = false;
  searchService = '';

  displayDialogService = false;
  displayAddService = false;
  displayEditService = false;

  selectedService: ServiceAnterieur | null = null;
  newService: ServiceForm = this.emptyForm();
  editService: ServiceForm | null = null;
  @ViewChild('addForm') addForm?: NgForm;
  @ViewChild('editForm') editForm?: NgForm;

  activiteList = [
    { label: '00000000 Type inconnu', value: '00000000' },
    { label: '00000011 Admin(pension RGR)', value: '00000011' },
    { label: '00000012 Office(pension RGR)', value: '00000012' },
    { label: '00000013 Org public(pension RGR)', value: '00000013' },
    { label: '00000021 Admin(sans pension RGR)', value: '00000021' },
    { label: '00000022 Ent pub(sans pension RGR)', value: '00000022' },
    { label: '00000030 Entreprise privée', value: '00000030' },
    { label: '00000031 Mission auprès état étran', value: '00000031' },
    { label: '00000032 Mission auprès org inter', value: '00000032' },
    { label: '00000041 Mandat public', value: '00000041' },
    { label: '00000042 Mandat syndical', value: '00000042' }
  ];

  typeContratList = [
    { label: 'Militaire', value: 'militaire' },
    { label: 'Civil', value: 'civil' },
    { label: 'Administration', value: 'administration' },
    { label: 'Autre', value: 'autre' },
    { label: 'Inconnu', value: 'inconnu' }
  ];

  constructor(
    private serviceApi: ServicesAnterieursService,
    private agentService: AgentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadPage();
  }

  loadAgents() {
    this.agentService.getAll().subscribe({
      next: (data: any) => {
        this.agents = data.content ? data.content : data;
      },
      error: (err: any) => console.error('Error loading agents', err)
    });
  }

  loadPage() {
    this.loading = true;

    this.serviceApi.getAll(0, 1000, '').subscribe({
      next: (res: PageResponse<ServiceAnterieur>) => {
        this.services = res.content ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement services antérieurs', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      }
    });
  }

  refreshTable() {
    this.loadPage();
  }

  clearServices(table: Table) {
    this.searchService = '';
    table.clear();
  }

  onViewService(item: ServiceAnterieur) {
    this.selectedService = item;
    this.displayDialogService = true;
  }

  showAddServiceDialog() {
    this.newService = this.emptyForm();
    this.newService.serviceValidable = 'X';
    this.displayAddService = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newService);
    });
  }

  addService() {
    if (!this.newService.agentId || !this.newService.dateDebut || !this.newService.finValidite ||
        !this.newService.localite?.trim() || !this.newService.activite?.trim() || !this.newService.typeContrat?.trim() || !this.newService.grade?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<ServiceAnterieur> = {
      agentId: this.newService.agentId,
      dateDebut: this.toIsoDate(this.newService.dateDebut),
      finValidite: this.toIsoDate(this.newService.finValidite),
      localite: this.newService.localite.trim(),
      codePays: this.newService.codePays?.trim() || '',
      activite: this.newService.activite.trim(),
      typeContrat: this.newService.typeContrat.trim(),
      serviceValidable: this.newService.serviceValidable || 'X',
      grade: this.newService.grade.trim()
    };

    this.loading = true;
    this.serviceApi.create(payload).subscribe({
      next: () => {
        this.displayAddService = false;
        this.loading = false;
        ToastHelper.showAdd(this.messageService);
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur create service antérieur', err);
        ToastHelper.showAddError(this.messageService, err?.error?.message);
        this.loading = false;
      }
    });
  }

  onEditService(item: ServiceAnterieur) {
    this.editService = {
      id: item.id,
      agentId: item.agentId,
      dateDebut: this.fromIsoDate(item.dateDebut),
      finValidite: this.fromIsoDate(item.finValidite),
      localite: item.localite || '',
      codePays: item.codePays || '',
      activite: item.activite || '',
      typeContrat: item.typeContrat || '',
      serviceValidable: item.serviceValidable || 'X',
      grade: item.grade || ''
    };
    this.displayEditService = true;
    setTimeout(() => {
      this.editForm?.resetForm(this.editService);
    });
  }

  updateService() {
    if (!this.editService?.id) return;

    if (!this.editService.agentId || !this.editService.dateDebut || !this.editService.finValidite ||
        !this.editService.localite?.trim() || !this.editService.activite?.trim() || !this.editService.typeContrat?.trim() || !this.editService.grade?.trim()) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload: Partial<ServiceAnterieur> = {
      agentId: this.editService.agentId,
      dateDebut: this.toIsoDate(this.editService.dateDebut),
      finValidite: this.toIsoDate(this.editService.finValidite),
      localite: this.editService.localite.trim(),
      codePays: this.editService.codePays?.trim() || '',
      activite: this.editService.activite.trim(),
      typeContrat: this.editService.typeContrat.trim(),
      serviceValidable: this.editService.serviceValidable || 'X',
      grade: this.editService.grade.trim()
    };

    this.loading = true;
    this.serviceApi.update(this.editService.id, payload).subscribe({
      next: () => {
        this.displayEditService = false;
        this.editService = null;
        this.loading = false;
        ToastHelper.showEdit(this.messageService);
        this.refreshTable();
      },
      error: (err) => {
        console.error('Erreur update service antérieur', err);
        ToastHelper.showUpdateError(this.messageService, err?.error?.message);
        this.loading = false;
      }
    });
  }

  onDeleteService(item: ServiceAnterieur) {
    if (!item?.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.loading = true;
      this.serviceApi.delete(item.id!).subscribe({
        next: () => {
          this.loading = false;
          ToastHelper.showDelete(this.messageService);
          this.refreshTable();
        },
        error: (err) => {
          console.error('Erreur delete service antérieur', err);
          ToastHelper.showDeleteError(this.messageService, err?.error?.message);
          this.loading = false;
        }
      });
    }, `Supprimer le service antérieur pour l'agent ${item.agentMatricule} ?`);
  }

  private emptyForm(): ServiceForm {
    return {
      agentId: undefined,
      dateDebut: null,
      finValidite: null,
      localite: '',
      codePays: '',
      activite: '',
      typeContrat: '',
      serviceValidable: 'X',
      grade: ''
    };
  }

  private toIsoDate(d: Date | null): string | null {
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromIsoDate(value: any): Date | null {
    if (!value) return null;
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
