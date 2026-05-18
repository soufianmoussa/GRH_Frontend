import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { environment } from '../../../../../environment';
import { JourFerie } from '../../../models/jourFerie.model';

export interface Holiday {
    date: string;
    localName: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class HolidayService {

    private readonly baseUrl = `${environment.apiUrl}/jours-feries`;

    private cache = new Map<number, Holiday[]>();

    private holidayDateSet = new Set<string>();

    private holidayNameMap = new Map<string, string>();

    constructor(private http: HttpClient) { }

    getHolidays(year: number): Observable<Holiday[]> {
        if (this.cache.has(year)) {
            return of(this.cache.get(year)!);
        }
        const params = new HttpParams().set('year', year);
        return this.http.get<JourFerie[]>(this.baseUrl, { params }).pipe(
            map(joursFeries => {
                const holidays: Holiday[] = joursFeries.map(jf => ({
                    date: jf.date,
                    localName: jf.label,
                    name: jf.label
                }));
                this.cache.set(year, holidays);
                holidays.forEach(h => {
                    this.holidayDateSet.add(h.date);
                    this.holidayNameMap.set(h.date, h.localName || h.name);
                });
                return holidays;
            })
        );
    }

    isHoliday(dateStr: string): boolean {
        return this.holidayDateSet.has(dateStr);
    }

    getHolidayName(dateStr: string): string | null {
        return this.holidayNameMap.get(dateStr) || null;
    }

    toDateString(date: { year: number; month: number; day: number }): string {
        const m = (date.month + 1).toString().padStart(2, '0');
        const d = date.day.toString().padStart(2, '0');
        return `${date.year}-${m}-${d}`;
    }

    calculateWorkingDays(start: Date, end: Date): number {
        if (!start || !end || start > end) return 0;

        let count = 0;
        const current = new Date(start);
        current.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            const dateStr = this.formatDate(current);

            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !this.holidayDateSet.has(dateStr)) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    }

    private formatDate(d: Date): string {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDatePublic(d: Date): string {
        return this.formatDate(d);
    }

    getHolidayDatesForYear(year: number): string[] {
        const holidays = this.cache.get(year);
        return holidays ? holidays.map(h => h.date) : [];
    }
}
