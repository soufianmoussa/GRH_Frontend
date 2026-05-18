import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {InputText} from 'primeng/inputtext';
import {FormsModule, NgForm} from '@angular/forms';
import {Button, ButtonDirective} from 'primeng/button';
import {Table, TableModule} from 'primeng/table';
import {Dialog} from 'primeng/dialog';
import {NgIf, CommonModule} from '@angular/common';
import {Anciennete} from '../../../../models/anciennete.model';
import {AncienneteService} from '../../services/anciennete/anciennete.service';
import {AgentModel} from '../../../../models/Agent.model';
import {AgentService} from '../../../dossier-agent/services/agent.service';
import {Select} from 'primeng/select';
import {DatePicker} from 'primeng/datepicker';
import {TooltipModule} from 'primeng/tooltip';
import {PageResponse} from '../../../../models/PageResponse.model';
import { MessageService, ConfirmationService, PrimeTemplate } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../../../shared/utils/toast-helper';

@Component({
  selector: 'app-dates-danciennete',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    InputText,
    FormsModule,
    Button,
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
    Select
  ],
  templateUrl: './dates-danciennete.component.html',
  styleUrl: './dates-danciennete.component.scss'
})
export class DatesDancienneteComponent implements OnInit {

  anciennetes: Anciennete[] = [];
  agents: AgentModel[] = [];
  loading = true;
  searchAnciennete = '';

  displayDialogAnciennete = false;
  displayAddAnciennete = false;
  displayEditAnciennete = false;

  selectedAnciennete: Anciennete | null = null;
  newAnciennete: Anciennete = this.emptyAnciennete();
  editAnciennete: Anciennete | null = null;
  @ViewChild('addForm') addForm?: NgForm;
  @ViewChild('editForm') editForm?: NgForm;

  constructor(
    private service: AncienneteService,
    private agentService: AgentService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadData();
  }

  loadAgents() {
    this.agentService.getAll().subscribe({
      next: (data: any) => {
        this.agents = data.content ? data.content : data;
      },
      error: (err: any) => console.error('Error loading agents', err)
    });
  }

  private emptyAnciennete(): Anciennete {
    return {
      agentId: undefined,
      admin: null,
      cadre: null,
      grade: null,
      echelon: null,
    };
  }

  loadData() {
    this.loading = true;
    this.service.getAll(0, 1000, '').subscribe({
      next: (res: PageResponse<Anciennete>) => {
        this.anciennetes = res.content ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading anciennetes:', err);
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      },
    });
  }

  clearAnciennete(table: Table) {
    this.searchAnciennete = '';
    table.clear();
  }

  onViewAnciennete(item: Anciennete) {
    this.selectedAnciennete = item;
    this.displayDialogAnciennete = true;
  }

  showAddAncienneteDialog() {
    this.newAnciennete = this.emptyAnciennete();
    this.displayAddAnciennete = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newAnciennete);
    });
  }

  addAnciennete() {
    if (!this.newAnciennete.agentId || !this.newAnciennete.admin || !this.newAnciennete.cadre || !this.newAnciennete.grade || !this.newAnciennete.echelon) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.newAnciennete,
      admin: this.toIso(this.newAnciennete.admin),
      cadre: this.toIso(this.newAnciennete.cadre),
      grade: this.toIso(this.newAnciennete.grade),
      echelon: this.toIso(this.newAnciennete.echelon),
    };

    this.service.add(payload).subscribe({
      next: () => {
        this.displayAddAnciennete = false;
        ToastHelper.showAdd(this.messageService);
        this.loadData();
      },
      error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message),
    });
  }

  onEditAnciennete(item: Anciennete) {
    this.editAnciennete = {
      ...item,
      admin: this.fromIso(item.admin) as any,
      cadre: this.fromIso(item.cadre) as any,
      grade: this.fromIso(item.grade) as any,
      echelon: this.fromIso(item.echelon) as any,
    };
    this.displayEditAnciennete = true;
    setTimeout(() => {
      this.editForm?.resetForm(this.editAnciennete);
    });
  }

  updateAnciennete() {
    if (!this.editAnciennete?.id) return;
    if (!this.editAnciennete.agentId || !this.editAnciennete.admin || !this.editAnciennete.cadre || !this.editAnciennete.grade || !this.editAnciennete.echelon) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const payload = {
      ...this.editAnciennete,
      admin: this.toIso(this.editAnciennete.admin),
      cadre: this.toIso(this.editAnciennete.cadre),
      grade: this.toIso(this.editAnciennete.grade),
      echelon: this.toIso(this.editAnciennete.echelon),
    };

    this.service.update(this.editAnciennete.id, payload).subscribe({
      next: () => {
        this.displayEditAnciennete = false;
        this.editAnciennete = null;
        ToastHelper.showEdit(this.messageService);
        this.loadData();
      },
      error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message),
    });
  }

  onDeleteAnciennete(item: Anciennete) {
    if (!item.id) return;

    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.service.delete(item.id!).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadData();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message),
      });
    }, `Supprimer les dates d'ancienneté pour l'agent ${item.agentMatricule} ?`);
  }

  private toIso(v: any): string | null {
    if (!v) return null;
    if (typeof v === 'string') return v;
    if (v instanceof Date) {
      const yyyy = v.getFullYear();
      const mm = String(v.getMonth() + 1).padStart(2, '0');
      const dd = String(v.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    return String(v);
  }

  private fromIso(v: string | null | undefined): Date | null {
    if (!v) return null;
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : dt;
  }
}
