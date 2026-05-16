import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { AgentService } from '../../services/AdminService/agent.service';
import { DossiersAgentsService } from '../../services/AdminService/DossiersAgents/dossiers-agents.service';
import { AgentModel } from '../../models/Agent.model';
import { AgentFullDto } from '../../models/agent-full.model';
import { AuthService } from '../../auth/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-agentcard',
  standalone: true,
  imports: [NgIf, DatePipe, ProgressSpinnerModule, MessageModule, TagModule],
  templateUrl: './agentcard.component.html',
  styleUrl: './agentcard.component.scss'
})
export class AgentcardComponent implements OnInit {

  agent: AgentModel | null = null;
  agentFull: AgentFullDto | null = null;
  photoUrl: string = 'assets/agentPhoto.jpg';

  loading = true;
  errorMsg: string | null = null;
  noAgentLinked = false;

  /** Emit the full DTO so the parent (mydata) can use it */
  @Output() agentLoaded = new EventEmitter<AgentFullDto>();

  constructor(
    private agentService: AgentService,
    private dossiersService: DossiersAgentsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentAgent();
  }

  private loadCurrentAgent(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.errorMsg = "Impossible de récupérer les informations de session.";
      this.loading = false;
      return;
    }

    if (!user.matricule) {
      this.noAgentLinked = true;
      this.loading = false;
      return;
    }

    this.agentService.search({ matricule: user.matricule }).subscribe({
      next: (results: AgentModel[]) => {
        if (results && results.length > 0) {
          this.agent = results[0];
          if (this.agent.id) {
            this.loadProfilePicture(this.agent.id);
            this.loadFullAgent(this.agent.id);
          }
        } else {
          this.noAgentLinked = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load agent', err);
        this.errorMsg = "Erreur lors du chargement des données.";
        this.loading = false;
      }
    });
  }

  private loadFullAgent(agentId: number): void {
    this.dossiersService.getFull(agentId).subscribe({
      next: (full) => {
        this.agentFull = full;
        this.agentLoaded.emit(full);
      },
      error: (err) => {
        console.error('Failed to load full agent', err);
      }
    });
  }

  private loadProfilePicture(agentId: number): void {
    this.agentService.getProfilePicture(agentId).subscribe({
      next: (file) => {
        if (file && file.url) {
          this.photoUrl = file.url;
        }
      },
      error: () => {}
    });
  }

  get situationLabel(): string {
    if (!this.agentFull?.situation) return '—';
    const map: Record<string, string> = { C: 'Célibataire', M: 'Marié(e)', V: 'Veuf(ve)', D: 'Divorcé(e)' };
    return map[this.agentFull.situation] || this.agentFull.situation;
  }
}
