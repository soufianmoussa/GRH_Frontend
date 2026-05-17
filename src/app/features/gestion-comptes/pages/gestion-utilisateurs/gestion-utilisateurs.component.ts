import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { Button, ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { GestionUtilisateursService } from '../../services/gestion-utilisateurs/gestion-utilisateurs.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    TableModule,
    Button,
    ButtonModule,
    FormsModule,
    InputText,
    Toast,
    TooltipModule,
    Tabs, TabList, Tab, TabPanels, TabPanel,
    TranslateModule
  ],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrl: './gestion-utilisateurs.component.scss'
})
export class GestionUtilisateursComponent implements OnInit, OnDestroy {
  searchGestion = '';
  gestionUtilisateursData: any;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private gestionUtilisateursService: GestionUtilisateursService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private router: Router,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.initializeData());
    this.initializeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeData() {
    if (this.searchGestion && this.searchGestion.trim().length > 0) {
      const criteria = { global: this.searchGestion.trim() };
      this.gestionUtilisateursService.searchAgents(criteria).subscribe({
        next: (res) => {
          this.gestionUtilisateursData = res;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error in searchAgents:', err);
          ToastHelper.handleApiError(this.messageService, err, this.translateService.instant('GLOBAL.ERREUR'));
        }
      });
    } else {
      this.gestionUtilisateursService.getAgents().subscribe({
        next: (res) => {
          this.gestionUtilisateursData = res;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error in gestionUtilisateursData:', err);
          ToastHelper.showLoadError(this.messageService);
        }
      });
    }
  }

  viewAgent(id: number) {
    this.router.navigate(['/dossiers-agents', id]);
  }

  onSearchChange(value: string): void {
    this.searchGestion = value;
    this.searchSubject.next(value);
  }

  clear(table: Table) {
    table.clear();
    this.searchGestion = '';
    this.initializeData();
  }
}
