import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressBarModule } from 'primeng/progressbar';
import { TabsModule } from 'primeng/tabs';
import { KnobModule } from 'primeng/knob';
import { SkeletonModule } from 'primeng/skeleton';

import {
  Accent,
  DashboardAlert,
  DashboardPeriod,
  DashboardService,
  DashboardSnapshot,
  Kpi,
  RecentActe,
  SeriesPoint
} from '../../services/dashboard.service';

/**
 * Admin BI dashboard.
 *
 * Visualisations: hand-rolled SVG (no Chart.js dependency).
 * Layout: PrimeNG tabs for progressive disclosure, with a top
 *   "Aperçu" tab that doubles as a daily command-center.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    SelectButtonModule,
    ProgressBarModule,
    TabsModule,
    KnobModule,
    SkeletonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  snapshot = signal<DashboardSnapshot | null>(null);
  loading = signal(true);
  selectedPeriod: DashboardPeriod = 'month';
  activeTab: string = 'overview';

  readonly periodOptions: { label: string; value: DashboardPeriod }[] = [
    { label: 'Jour',      value: 'today' },
    { label: 'Semaine',   value: 'week' },
    { label: 'Mois',      value: 'month' },
    { label: 'Trimestre', value: 'quarter' },
    { label: 'Année',     value: 'year' }
  ];

  /** Tab definitions — single source of truth for the navbar at the top. */
  readonly tabs = [
    { key: 'overview',   label: 'Aperçu',      icon: 'pi pi-th-large'   },
    { key: 'workforce',  label: 'Effectifs',   icon: 'pi pi-users'      },
    { key: 'onboarding', label: 'Onboarding',  icon: 'pi pi-user-plus'  },
    { key: 'finance',    label: 'Finance',     icon: 'pi pi-wallet'     },
    { key: 'activity',   label: 'Activité',    icon: 'pi pi-history'    }
  ];

  // ---------- Computed derived metrics ----------
  validationRate = computed(() => {
    const s = this.snapshot();
    if (!s) return 0;
    const f = s.onboardingFunnel;
    const total = f.toActivate + f.inProgress + f.toValidate + f.validated + f.rejected;
    if (total === 0) return 0;
    return Math.round((f.validated / total) * 100);
  });

  totalOnboarding = computed(() => {
    const s = this.snapshot();
    if (!s) return 0;
    const f = s.onboardingFunnel;
    return f.toActivate + f.inProgress + f.toValidate + f.validated + f.rejected;
  });

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.refresh();
  }

  // ---------- Actions ----------
  onPeriodChange(value: DashboardPeriod | null): void {
    if (!value) return;
    this.selectedPeriod = value;
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.dashboardService.getSnapshot(this.selectedPeriod).subscribe(snap => {
      this.snapshot.set(snap);
      this.loading.set(false);
    });
  }

  exportSnapshot(): void {
    const snap = this.snapshot();
    if (!snap) return;
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${snap.period}-${snap.generatedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  go(route?: string): void {
    if (route) this.router.navigate([route]);
  }

  voirActe(acte: RecentActe): void {
    const routes: Record<string, string> = {
      'Détachement': '/Detachement',
      'Mise en disponibilité': '/MiseEnDisponibilite',
      'Réintégration': '/Reintegration',
      'Radiation': '/Radiation',
      'Prise en charge': '/PriseEnCharge',
      'Stage formation': '/StageFormation',
      'Suspension': '/Suspension',
      'Sanction': '/Sanction'
    };
    this.router.navigate([routes[acte.typeDemande] ?? '/dashboard']);
  }

  // ============================================================
  // Template helpers — styling & SVG math
  // ============================================================
  acteSeverity(status?: string): 'success' | 'warn' | 'danger' | 'info' {
    return status === 'APPROVED' ? 'success'
         : status === 'PENDING'  ? 'warn'
         : status === 'REJECTED' ? 'danger' : 'info';
  }
  acteLabel(status?: string): string {
    return status === 'APPROVED' ? 'Approuvé'
         : status === 'PENDING'  ? 'En attente'
         : status === 'REJECTED' ? 'Rejeté' : status ?? '-';
  }

  alertSeverity(s: DashboardAlert['severity']): 'success' | 'warn' | 'danger' | 'info' {
    return s === 'critical' ? 'danger' : s === 'warning' ? 'warn' : 'info';
  }

  trendClass(kpi: Kpi): string {
    if (!kpi.deltaPct || kpi.trend === 'flat') return 'is-flat';
    const isUp = kpi.trend === 'up';
    const good = kpi.positiveIsGood === true ? isUp : !isUp;
    return good ? 'is-good' : 'is-bad';
  }
  trendArrow(kpi: Kpi): string {
    if (!kpi.trend || kpi.trend === 'flat') return 'pi pi-minus';
    return kpi.trend === 'up' ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right';
  }

  pendingTone(days: number): 'danger' | 'warn' | 'info' {
    return days >= 7 ? 'danger' : days >= 3 ? 'warn' : 'info';
  }

  /** Hex color from the curated accent palette. */
  accentColor(a?: Accent): string {
    return ({
      teal:    '#198897',
      indigo:  '#2a52be',
      violet:  '#7c3aed',
      amber:   '#f59e0b',
      emerald: '#10b981',
      rose:    '#dc2626',
      pink:    '#ec4899'
    } as Record<string, string>)[a ?? 'indigo'] ?? '#2a52be';
  }

  // ============================================================
  // SVG dataviz helpers
  // ============================================================

  /** Path "M0,h L x0,y0 L x1,y1 … L W,h Z" used to fill the area under a line. */
  sparkAreaPath(values: number[], w = 100, h = 32): string {
    if (!values?.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = w / (values.length - 1);
    const pts = values.map((v, i) => `${(i * stepX).toFixed(2)},${(h - ((v - min) / range) * (h - 4) - 2).toFixed(2)}`);
    return `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
  }

  /** Same points but as an open polyline (the stroke on top of the area). */
  sparkLinePath(values: number[], w = 100, h = 32): string {
    if (!values?.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = w / (values.length - 1);
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * stepX).toFixed(2)},${(h - ((v - min) / range) * (h - 4) - 2).toFixed(2)}`)
      .join(' ');
  }

  /** Bigger trend chart used in the Workforce tab. */
  trendLinePath(values: number[], w: number, h: number, paddingY = 12): string {
    if (!values?.length) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = w / (values.length - 1);
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * stepX).toFixed(2)},${(h - paddingY - ((v - min) / range) * (h - paddingY * 2)).toFixed(2)}`)
      .join(' ');
  }
  trendAreaPath(values: number[], w: number, h: number, paddingY = 12): string {
    const line = this.trendLinePath(values, w, h, paddingY).replace('M ', 'M ');
    return `${line} L ${w.toFixed(2)},${h} L 0,${h} Z`;
  }

  /** Coordinates of each datapoint — useful for drawing dots. */
  trendPoints(values: number[], w: number, h: number, paddingY = 12): { x: number; y: number; v: number }[] {
    if (!values?.length) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = w / (values.length - 1);
    return values.map((v, i) => ({
      x: +(i * stepX).toFixed(2),
      y: +(h - paddingY - ((v - min) / range) * (h - paddingY * 2)).toFixed(2),
      v
    }));
  }

  /** Cumulative percentage offsets used to draw a donut chart with stacked arcs. */
  donutSegments(items: SeriesPoint[], radius = 40, stroke = 14): { dasharray: string; dashoffset: number; color: string; pct: number }[] {
    const total = items.reduce((sum, it) => sum + it.value, 0) || 1;
    const circumference = 2 * Math.PI * radius;
    const colors = ['#2a52be', '#dc2626', '#ec4899', '#f59e0b', '#64748b', '#198897', '#7c3aed', '#10b981'];
    let accumulated = 0;
    return items.map((it, idx) => {
      const pct = it.value / total;
      const arc = pct * circumference;
      const gap = circumference - arc;
      const dashoffset = -accumulated * circumference;
      accumulated += pct;
      return { dasharray: `${arc.toFixed(2)} ${gap.toFixed(2)}`, dashoffset, color: colors[idx % colors.length], pct: Math.round(pct * 100) };
    });
  }

  /** Returns the max value of a series — used to scale bar widths. */
  seriesMax(items: SeriesPoint[]): number {
    return items.length ? Math.max(...items.map(p => p.value)) : 0;
  }

  /** Total value of a series — used for donut centers. */
  seriesTotal(items: SeriesPoint[]): number {
    return items.reduce((sum, it) => sum + it.value, 0);
  }

  pyramidMax(): number {
    const p = this.snapshot()?.agePyramid;
    if (!p) return 0;
    return Math.max(...p.men, ...p.women);
  }

  /** Width % for a horizontal bar given a value and the series max. */
  barPct(value: number, max: number): number {
    if (max <= 0) return 0;
    return Math.round((value / max) * 100);
  }

  /** Used in the funnel: percentage of stage relative to the start. */
  funnelPct(value: number): number {
    const start = this.snapshot()?.onboardingFunnel?.toActivate ?? 0;
    const base = Math.max(start, 1);
    return Math.min(100, Math.round((value / base) * 100));
  }
}
