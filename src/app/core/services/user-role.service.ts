import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserRoleService {

  private selectedRoleSubject = new BehaviorSubject<string | null>(null);
  selectedRole$ = this.selectedRoleSubject.asObservable();

  setRole(role: string) {
    this.selectedRoleSubject.next(role);
  }

  getRole(): string | null {
    return this.selectedRoleSubject.value;
  }
}
