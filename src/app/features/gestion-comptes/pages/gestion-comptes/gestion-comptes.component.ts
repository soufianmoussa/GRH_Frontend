import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { GestionComptesService } from '../../services/gestion-comptes/gestion-comptes.service';
import { GestionUtilisateursService } from '../../services/gestion-utilisateurs/gestion-utilisateurs.service';
import { ResponsableUniteService } from '../../../gestion-organisationnelle/services/responsable-unite.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { InputText } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AccountDTO, AccountSearchParams, AuthAuditLogDTO } from '../../../../core/auth/auth.models';
import { Menu } from 'primeng/menu';
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'app-gestion-comptes',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule, FormsModule, TableModule, Dialog, Toast, ConfirmDialogModule,
    DropdownModule, InputText, CheckboxModule, MultiSelectModule, TagModule,
    ButtonModule, TooltipModule,
    Tabs, TabList, Tab, TabPanels, TabPanel, FloatLabelModule,
    TranslateModule,
    Menu,
    Drawer
  ],
  templateUrl: './gestion-comptes.component.html',
  styleUrl: './gestion-comptes.component.scss'
})
export class GestionComptesComponent implements OnInit {

  accounts: AccountDTO[] = [];

  unites: any[] = [];
  selectedUniteId: any = null;
  agents: any[] = [];
  rawAgents: any[] = [];
  responsablesIds = new Set<number>();

  searchText = '';
  loading = false;
  totalRecords = 0;
  first = 0;
  pageSize = 10;
  roleFilter: string | null = null;
  enabledFilter: boolean | null = null;
  lockedFilter: boolean | null = null;
  linkedFilter: boolean | null = null;

  displayAddDialog = false;
  displayEditRolesDialog = false;
  displayResetPasswordDialog = false;
  displayLinkAgentDialog = false;
  displayDetailsDrawer = false;

  newAccount: any = { roles: [] };
  selectedAccount: any = null;
  selectedActionAccount: AccountDTO | null = null;
  selectedRoleValues: string[] = [];
  newPassword = '';
  newAccountPasswordConfirm = '';
  resetPasswordConfirm = '';
  actionMenuItems: MenuItem[] = [];
  drawerTab = 'general';
  auditLogs: AuthAuditLogDTO[] = [];
  auditLoading = false;

  @ViewChild('addForm') addForm?: NgForm;
  @ViewChild('editForm') editForm?: NgForm;
  @ViewChild('editRolesForm') editRolesForm?: NgForm;

  availableRoles = [
    { label: 'Administrateur', value: 'ADMIN' },
    { label: 'Agent', value: 'AGENT' },
    { label: 'Responsable d\'unité', value: 'RESPONSABLE_UNITE' }
  ];

  roleFilterOptions = [
    { label: 'Tous les roles', value: null },
    ...this.availableRoles
  ];

  statusFilterOptions = [
    { label: 'Tous les statuts', value: null },
    { label: 'Actifs', value: true },
    { label: 'Inactifs', value: false }
  ];

  lockedFilterOptions = [
    { label: 'Tous', value: null },
    { label: 'Verrouilles', value: true },
    { label: 'Non verrouilles', value: false }
  ];

  linkedFilterOptions = [
    { label: 'Tous', value: null },
    { label: 'Lies a un agent', value: true },
    { label: 'Non lies', value: false }
  ];

  constructor(
    private compteService: GestionComptesService,
    private agentsService: GestionUtilisateursService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private responsableUniteService: ResponsableUniteService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadUnites();
    this.loadResponsables();
  }

  loadAccounts(page = this.first / this.pageSize, size = this.pageSize) {
    this.loading = true;
    const params: AccountSearchParams = {
      search: this.searchText?.trim(),
      role: this.roleFilter,
      enabled: this.enabledFilter,
      locked: this.lockedFilter,
      linked: this.linkedFilter,
      page,
      size,
      sort: 'username,asc'
    };

    this.compteService.searchAccounts(params).subscribe({
      next: (res) => {
        this.accounts = res.content || [];
        this.totalRecords = res.totalElements || 0;
        this.pageSize = res.size || size;
        this.first = (res.number || 0) * this.pageSize;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const detail = ToastHelper.extractErrorMessage(err, 'Impossible de charger les comptes');
        this.messageService.add({ severity: 'error', summary: this.translateService.instant('GLOBAL.ERREUR'), detail });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadUnites() {
    this.responsableUniteService.getUnites().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.content || []);
        this.unites = data;
        this.cdr.detectChanges();
      }
    });
  }

  loadResponsables() {
    this.responsableUniteService.getAll(0, 10000).subscribe({
      next: (res: any) => {
        const respList = res?.content || res || [];
        respList.forEach((r: any) => {
          if (r.agentId) this.responsablesIds.add(r.agentId);
        });
      }
    });
  }

  onUniteChange() {
    this.agents = [];
    this.newAccount.agentId = null;
    this.rawAgents = [];
    
    if (!this.selectedUniteId) {
      this.cdr.detectChanges();
      return;
    }

    this.agentsService.getAgentsByUniteId(this.selectedUniteId).subscribe({
      next: (res: any) => {
        // Robust extraction: Handle both Array and Page objects
        const data = Array.isArray(res) ? res : (res?.content || []);
        this.rawAgents = data;
        this.agents = data.map((a: any) => ({
          ...a,
          libelle: `${a.nom} ${a.prenom}`
        }));
        
        // Explicitly trigger change detection so the dropdown updates visually
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: this.translateService.instant('GLOBAL.ERREUR'), detail: 'Impossible de charger les agents' });
      }
    });
  }

  onAgentChange() {
    const agentId = this.newAccount.agentId;
    if (!agentId) return;

    const agent = this.rawAgents.find(a => a.id === agentId);
    if (agent) {
      const generated = `${agent.prenom.toLowerCase()}.${agent.nom.toLowerCase()}`.replace(/\s+/g, '');
      this.newAccount.username = generated;
      this.newAccount.password = '';
      this.newAccountPasswordConfirm = '';

      this.newAccount.roles = [];

      if (this.responsablesIds.has(agentId)) {
        this.newAccount.roles = ['RESPONSABLE_UNITE', 'AGENT'];
      } else {
        this.newAccount.roles = ['AGENT'];
      }
    }
  }

  onLazyLoad(event: any) {
    this.first = event.first || 0;
    this.pageSize = event.rows || this.pageSize;
    this.loadAccounts(this.first / this.pageSize, this.pageSize);
  }

  applySearch() {
    this.first = 0;
    this.loadAccounts(0, this.pageSize);
  }

  clearFilters() {
    this.searchText = '';
    this.roleFilter = null;
    this.enabledFilter = null;
    this.lockedFilter = null;
    this.linkedFilter = null;
    this.applySearch();
  }

  openActionsMenu(event: Event, account: AccountDTO, menu: any) {
    this.selectedActionAccount = account;
    this.actionMenuItems = this.buildActionMenu(account);
    menu.toggle(event);
  }

  private buildActionMenu(account: AccountDTO): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: 'Consulter',
        icon: 'pi pi-eye',
        command: () => this.showDetailsDrawer(account)
      },
      {
        label: 'Gerer les roles',
        icon: 'pi pi-user-edit',
        command: () => this.showEditRolesDialog(account)
      },
      {
        label: 'Reinitialiser le mot de passe',
        icon: 'pi pi-key',
        command: () => this.showResetPassword(account)
      },
      {
        separator: true
      },
      {
        label: account.enabled ? 'Desactiver le compte' : 'Activer le compte',
        icon: account.enabled ? 'pi pi-ban' : 'pi pi-check',
        command: () => this.confirmToggleStatus(account)
      }
    ];

    if (account.failedAttempts >= 5 || account.lockUntil) {
      items.push({
        label: 'Deverrouiller',
        icon: 'pi pi-unlock',
        command: () => this.confirmUnlock(account)
      });
    }

    return items;
  }

  showDetailsDrawer(account: AccountDTO) {
    this.selectedAccount = { ...account };
    this.drawerTab = 'general';
    this.displayDetailsDrawer = true;
    this.loadAuditHistory(account.username);
  }

  loadAuditHistory(username = this.selectedAccount?.username) {
    if (!username) {
      this.auditLogs = [];
      return;
    }

    this.auditLoading = true;
    this.compteService.searchAuditLogs({
      username,
      page: 0,
      size: 10,
      sort: 'timestamp,desc'
    }).subscribe({
      next: (res) => {
        this.auditLogs = res.content || [];
        this.auditLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const detail = ToastHelper.extractErrorMessage(err, "Impossible de charger l'historique du compte");
        this.messageService.add({ severity: 'error', summary: this.translateService.instant('GLOBAL.ERREUR'), detail });
        this.auditLogs = [];
        this.auditLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get selectedStatusLabel() {
    if (!this.selectedAccount) return '';
    if (!this.selectedAccount.enabled) return 'Inactif';
    if (this.selectedAccount.failedAttempts >= 5 || this.selectedAccount.lockUntil) return 'Verrouille';
    return 'Actif';
  }

  get selectedStatusSeverity(): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    if (!this.selectedAccount?.enabled) return 'danger';
    if (this.selectedAccount.failedAttempts >= 5 || this.selectedAccount.lockUntil) return 'warn';
    return 'success';
  }

  showAddDialog() {
    this.newAccount = { roles: [] };
    this.newAccountPasswordConfirm = '';
    this.selectedUniteId = null;
    this.agents = [];
    this.displayAddDialog = true;
    setTimeout(() => {
      this.addForm?.resetForm(this.newAccount);
    });
  }

  saveNewAccount() {
    if (this.addForm?.invalid) {
      this.addForm.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('GLOBAL.ATTENTION'), detail: 'Veuillez remplir correctement tous les champs obligatoires' });
      return;
    }
    if (!this.newAccount.username || !this.newAccount.password || this.newAccount.roles.length === 0) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('GLOBAL.ATTENTION'), detail: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }
    if (this.newAccount.password.length < 12) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('GLOBAL.ATTENTION'), detail: 'Le mot de passe doit contenir au moins 12 caracteres' });
      return;
    }
    if (this.newAccount.password !== this.newAccountPasswordConfirm) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('GLOBAL.ATTENTION'), detail: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (this.newAccount.roles.includes('RESPONSABLE_UNITE') && !this.responsablesIds.has(this.newAccount.agentId)) {
      this.messageService.add({ severity: 'error', summary: this.translateService.instant('GLOBAL.ERREUR'), detail: 'Cet agent n\'est pas un responsable d\'unité.' });
      return;
    }

    this.compteService.createAccount(this.newAccount).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translateService.instant('GLOBAL.SUCCES'), detail: 'Compte créé' });
        this.displayAddDialog = false;
        this.loadAccounts();
      },
      error: (err: any) => {
        const errorMsg = ToastHelper.extractErrorMessage(err, 'Erreur lors de la création');
        this.messageService.add({ severity: 'error', summary: this.translateService.instant('GLOBAL.ERREUR'), detail: errorMsg });
      }
    });
  }

  showEditRolesDialog(account: AccountDTO) {
    this.selectedAccount = { ...account };
    this.selectedRoleValues = [...(account.roles || [])];

    this.agentsService.getAgents().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.content || []);
        this.agents = data.map((a: any) => ({
          ...a,
          libelle: `${a.nom} ${a.prenom} (${a.matricule})`
        }));
        
        this.displayEditRolesDialog = true;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.editRolesForm?.resetForm({
            e_roles: this.selectedRoleValues,
            e_agent: this.selectedAccount.agentId
          });
        });
      }
    });
  }

  updateRoles() {
    if (!this.selectedAccount) {
      return;
    }
    if (this.selectedRoleValues.length === 0) {
      ToastHelper.showWarn(this.messageService, 'Au moins un rôle est requis');
      return;
    }
    const req = {
      roles: [...this.selectedRoleValues],
      agentId: this.selectedAccount.agentId
    };
    this.compteService.updateRoles(this.selectedAccount.id, req).subscribe({
      next: () => {
        ToastHelper.showSuccess(this.messageService, 'Rôles mis à jour');
        this.displayEditRolesDialog = false;
        this.loadAccounts();
      },
      error: (err: any) => {
        ToastHelper.handleApiError(this.messageService, err, 'Mise à jour impossible');
      }
    });
  }

  confirmToggleStatus(account: any) {
    const action = account.enabled ? 'désactiver' : 'activer';
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment ${action} le compte ${account.username} ?`,
      accept: () => {
        this.compteService.toggleStatus(account.id, !account.enabled).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: this.translateService.instant('GLOBAL.SUCCES'), detail: `Compte ${action}` });
            this.loadAccounts();
          },
          error: (err: any) => {
            const errorMsg = ToastHelper.extractErrorMessage(err, 'Action impossible');
            this.messageService.add({ severity: 'error', summary: this.translateService.instant('GLOBAL.ERREUR'), detail: errorMsg });
          }
        });
      }
    });
  }

  confirmUnlock(account: any) {
    this.confirmationService.confirm({
      message: `Voulez-vous déverrouiller manuellement le compte ${account.username} ?`,
      accept: () => {
        this.compteService.unlockAccount(account.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: this.translateService.instant('GLOBAL.SUCCES'), detail: `Compte déverrouillé` });
            this.loadAccounts();
          },
          error: (err: any) => {
            const errorMsg = ToastHelper.extractErrorMessage(err, 'Action impossible');
            this.messageService.add({ severity: 'error', summary: this.translateService.instant('GLOBAL.ERREUR'), detail: errorMsg });
          }
        });
      }
    });
  }

  showResetPassword(account: any) {
    this.selectedAccount = { ...account };
    this.newPassword = '';
    this.resetPasswordConfirm = '';
    this.displayResetPasswordDialog = true;
    setTimeout(() => {
      this.editForm?.resetForm({ newPassword: this.newPassword });
    });
  }

  changePassword() {
    if (!this.newPassword || this.newPassword.length < 12) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('GLOBAL.ATTENTION'), detail: 'Mot de passe trop court' });
      return;
    }
    if (this.newPassword !== this.resetPasswordConfirm) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('GLOBAL.ATTENTION'), detail: 'Les mots de passe ne correspondent pas' });
      return;
    }
    this.compteService.resetPassword(this.selectedAccount.id, { newPassword: this.newPassword }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translateService.instant('GLOBAL.SUCCES'), detail: 'Mot de passe réinitialisé' });
        this.displayResetPasswordDialog = false;
        this.loadAccounts();
      },
      error: (err: any) => {
        const errorMsg = ToastHelper.extractErrorMessage(err, 'Mise à jour impossible');
        this.messageService.add({ severity: 'error', summary: this.translateService.instant('GLOBAL.ERREUR'), detail: errorMsg });
      }
    });
  }

  get activeAccounts() {
    return this.accounts.filter(a => a.enabled).length;
  }

  get lockedAccounts() {
    return this.accounts.filter(a => a.failedAttempts >= 5 || a.lockUntil).length;
  }

  get unlinkedAccounts() {
    return this.accounts.filter(a => !a.agentId).length;
  }

  get totalAccounts() {
    return this.totalRecords;
  }
}
