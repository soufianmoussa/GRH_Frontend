import { Component, OnInit, ViewChild } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastHelper } from '../../../../shared/utils/toast-helper';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { PopoverModule, Popover } from 'primeng/popover';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JourFerie, JourFerieCreateUpdateRequest } from '../../../../models/jourFerie.model';
import { JourFerieService, NagerPublicHoliday } from '../../services/jour-ferie/jour-ferie.service';

type HolidayType = 'NATIONAL' | 'RELIGIEUX';

interface CalendarDayCell {
  day: number;
  iso: string;
  inMonth: boolean;
  isToday: boolean;
  isSunday: boolean;
  holidays: JourFerie[];
}

@Component({
  selector: 'app-jours-feries',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    Button,
    InputText,
    FormsModule,
    ButtonDirective,
    TooltipModule,
    Dialog,
    DropdownModule,
    Toast,
    ConfirmDialogModule,
    FloatLabelModule,
    CheckboxModule,
    CalendarModule,
    TagModule,
    PopoverModule
  ],
  templateUrl: './jours-feries.component.html',
  styleUrl: './jours-feries.component.scss'
})
export class JoursFeriesComponent implements OnInit {

  loading = false;

  /** Years for which we've already attempted the auto-import (avoids loops). */
  private autoImportedYears = new Set<number>();

  displayDialog = false;
  dialogMode: 'add' | 'edit' = 'add';

  form: any = {};
  @ViewChild('addForm') addForm?: NgForm;
  @ViewChild('dayPopover') dayPopover?: Popover;

  joursFeries: JourFerie[] = [];

  /** Current month being viewed (year + month index). */
  viewYear: number = new Date().getFullYear();
  viewMonth: number = new Date().getMonth();

  selectedDayHolidays: JourFerie[] = [];
  selectedDayLabel = '';

  readonly typeOptions: { label: string; value: HolidayType }[] = [
    { label: 'National', value: 'NATIONAL' },
    { label: 'Religieux', value: 'RELIGIEUX' }
  ];

  readonly monthLabels = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  /** Monday-first headers. */
  readonly weekdayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  private readonly fullWeekdays = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  constructor(
    private jourFerieService: JourFerieService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.jourFerieService.getAll(this.viewYear).subscribe({
      next: (data) => {
        this.joursFeries = [...data].sort((a, b) => a.date.localeCompare(b.date));
        this.loading = false;
        this.maybeAutoImport();
      },
      error: () => {
        ToastHelper.showLoadError(this.messageService);
        this.loading = false;
      }
    });
  }

  /**
   * Auto-import official Moroccan public holidays from the Nager.Date API
   * the first time we visit a year that has no holidays yet. Idempotent:
   * we mark the year as attempted so a failed/empty import doesn't loop.
   */
  private maybeAutoImport(): void {
    if (this.joursFeries.length > 0) return;
    if (this.autoImportedYears.has(this.viewYear)) return;
    const year = this.viewYear;
    this.autoImportedYears.add(year);
    this.runAutoImport(year);
  }

  private runAutoImport(year: number): void {
    this.jourFerieService.fetchPublicHolidays(year, 'MA').subscribe({
      next: (holidays) => {
        if (!holidays?.length) return;
        const existingDates = new Set(this.joursFeries.map(jf => jf.date));
        const toCreate = holidays.filter(h => !existingDates.has(h.date));
        if (toCreate.length === 0) return;

        const requests = toCreate.map(h =>
          this.jourFerieService.create({
            date: h.date,
            label: h.localName || h.name,
            type: 'NATIONAL',
            recurring: !!h.fixed,
            countryCode: h.countryCode || 'MA'
          }).pipe(catchError(() => of(null)))
        );

        forkJoin(requests).subscribe({
          next: (results) => {
            const created = results.filter(r => r !== null).length;
            if (created > 0 && year === this.viewYear) {
              ToastHelper.showInfo(
                this.messageService,
                `${created} jour(s) férié(s) officiel(s) importé(s) automatiquement.`
              );
              this.jourFerieService.getAll(year).subscribe({
                next: (data) => {
                  if (year !== this.viewYear) return;
                  this.joursFeries = [...data].sort((a, b) => a.date.localeCompare(b.date));
                }
              });
            }
          }
        });
      }
      // Silent failure: auto-import is a convenience, not a critical action.
    });
  }

  /* ── Month navigation ── */

  shiftMonth(delta: number): void {
    let m = this.viewMonth + delta;
    let y = this.viewYear;
    while (m < 0)  { m += 12; y--; }
    while (m > 11) { m -= 12; y++; }
    const yearChanged = y !== this.viewYear;
    this.viewMonth = m;
    this.viewYear = y;
    this.dayPopover?.hide();
    if (yearChanged) {
      this.loadData();
    }
  }

  goToToday(): void {
    const now = new Date();
    const yearChanged = now.getFullYear() !== this.viewYear;
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
    this.dayPopover?.hide();
    if (yearChanged) this.loadData(); // else current data already covers this year
  }

  /* ── Calendar grid ── */

  get calendarWeeks(): CalendarDayCell[][] {
    const todayIso = this.formatDate(new Date());
    const byDate = new Map<string, JourFerie[]>();
    for (const jf of this.joursFeries) {
      const list = byDate.get(jf.date) ?? [];
      list.push(jf);
      byDate.set(jf.date, list);
    }

    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const offset = (firstOfMonth.getDay() + 6) % 7; // Monday-first
    const gridStart = new Date(this.viewYear, this.viewMonth, 1 - offset);

    const weeks: CalendarDayCell[][] = [];
    for (let w = 0; w < 6; w++) {
      const week: CalendarDayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + w * 7 + d);
        const iso = this.formatDate(date);
        week.push({
          day: date.getDate(),
          iso,
          inMonth: date.getMonth() === this.viewMonth,
          isToday: iso === todayIso,
          isSunday: date.getDay() === 0,
          holidays: byDate.get(iso) ?? []
        });
      }
      weeks.push(week);
    }
    return weeks;
  }

  countByType(type: HolidayType): number {
    return this.joursFeries.filter(jf => jf.type === type).length;
  }

  get recurringCount(): number {
    return this.joursFeries.filter(jf => jf.recurring).length;
  }

  /* ── Day interaction ── */

  onDayClick(event: MouseEvent, cell: CalendarDayCell): void {
    if (!cell.holidays.length) return;
    this.selectedDayHolidays = cell.holidays;
    this.selectedDayLabel = this.formatLongDate(cell.iso);
    this.dayPopover?.show(event);
  }

  /* ── CRUD ── */

  showAddDialog(): void {
    this.dayPopover?.hide();
    this.dialogMode = 'add';
    this.form = {
      date: null,
      label: '',
      type: 'NATIONAL',
      recurring: false,
      countryCode: 'MA'
    };
    this.displayDialog = true;
    setTimeout(() => this.addForm?.resetForm(this.form));
  }

  onEdit(item: JourFerie): void {
    this.dayPopover?.hide();
    this.dialogMode = 'edit';
    this.form = {
      id: item.id,
      date: this.parseDate(item.date),
      label: item.label,
      type: item.type,
      recurring: item.recurring,
      countryCode: item.countryCode
    };
    this.displayDialog = true;
    setTimeout(() => this.addForm?.resetForm(this.form));
  }

  save(): void {
    const f = this.form;
    if (!f.label?.trim() || !f.date || !f.type) {
      ToastHelper.showFormError(this.messageService);
      return;
    }

    const dateVal = f.date instanceof Date ? this.formatDate(f.date) : f.date;

    const payload: JourFerieCreateUpdateRequest = {
      date: dateVal,
      label: f.label.trim(),
      type: f.type,
      recurring: f.recurring ?? false,
      countryCode: f.countryCode || 'MA'
    };

    if (this.dialogMode === 'add') {
      this.jourFerieService.create(payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showAdd(this.messageService);
          this.loadData();
        },
        error: (err) => ToastHelper.showAddError(this.messageService, err?.error?.message)
      });
    } else {
      this.jourFerieService.update(f.id, payload).subscribe({
        next: () => {
          this.displayDialog = false;
          ToastHelper.showEdit(this.messageService);
          this.loadData();
        },
        error: (err) => ToastHelper.showUpdateError(this.messageService, err?.error?.message)
      });
    }
  }

  onDelete(item: JourFerie): void {
    if (!item?.id) return;
    this.dayPopover?.hide();
    ToastHelper.confirmDelete(this.confirmationService, () => {
      this.jourFerieService.delete(item.id).subscribe({
        next: () => {
          ToastHelper.showDelete(this.messageService);
          this.loadData();
        },
        error: (err) => ToastHelper.showDeleteError(this.messageService, err?.error?.message)
      });
    }, `Supprimer le jour férié "${item.label}" ?`);
  }

  /* ── Helpers ── */

  getTypeLabel(type: string): string {
    return this.typeOptions.find(t => t.value === type)?.label || type;
  }

  getTypeSeverity(type: string): 'info' | 'success' | 'warn' | 'secondary' {
    switch (type) {
      case 'NATIONAL':  return 'info';
      case 'RELIGIEUX': return 'success';
      default:          return 'secondary';
    }
  }

  trackById = (_: number, item: JourFerie) => item.id;
  trackByIso = (_: number, cell: CalendarDayCell) => cell.iso;
  trackByWeek = (i: number, _week: CalendarDayCell[]) => i;

  private parseDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatLongDate(iso: string): string {
    const d = this.parseDate(iso);
    return `${this.fullWeekdays[d.getDay()]} ${d.getDate()} ${this.monthLabels[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
  }
}
