import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminOnboardingService } from './admin-onboarding.service';
import { AgentOnboardingService } from './agent-onboarding.service';
import { OnboardingDetail } from '../../../models/onboarding.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentOnboardingService {
  constructor(
    private adminOnboardingService: AdminOnboardingService,
    private agentOnboardingService: AgentOnboardingService
  ) {}

  uploadForAgent(documentId: number, file: File): Observable<OnboardingDetail> {
    return this.agentOnboardingService.uploadDocument(documentId, file);
  }

  uploadForAdmin(onboardingId: number, documentId: number, file: File): Observable<OnboardingDetail> {
    return this.adminOnboardingService.uploadDocument(onboardingId, documentId, file);
  }

  validate(onboardingId: number, documentId: number): Observable<OnboardingDetail> {
    return this.adminOnboardingService.validateDocument(onboardingId, documentId);
  }

  reject(onboardingId: number, documentId: number, reason: string): Observable<OnboardingDetail> {
    return this.adminOnboardingService.rejectDocument(onboardingId, documentId, reason);
  }
}
