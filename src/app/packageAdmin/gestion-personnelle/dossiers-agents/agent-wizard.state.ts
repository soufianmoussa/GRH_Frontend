import { Injectable, signal, computed } from '@angular/core';
import { AgentCreateRequest, AgentFullDto } from '../../../models/agent-full.model';
import { Matricule } from '../../../models/initialisation-matricules.model';

export type WizardMode = 'create' | 'edit' | 'view';

/** Brouillon en cours de saisie dans le stepper. */
const emptyDraft = (): AgentCreateRequest => ({
  matriculeId: null,
  matricule: '',
  dateRecrutement: '',
  domaine: '',
  sousDomaine: '',
  categorie: '',
  typeContrat: '',
  nom: '',
  prenom: '',
  cin: '',
  adresses: [],
  enfants: [],
});

/**
 * État partagé du wizard (signaux Angular).
 * - Porte le brouillon de l'agent en cours de saisie
 * - Persiste dans localStorage pour survivre à un reload en mode création
 * - Le mode edit repart toujours du backend (pas de cache local)
 */
@Injectable({ providedIn: 'root' })
export class AgentWizardState {
  private readonly STORAGE_KEY = 'dossier-agent-wizard-draft';

  readonly mode = signal<WizardMode>('create');
  readonly activeStep = signal<number>(1);
  readonly selectedMatricule = signal<Matricule | null>(null);
  readonly draft = signal<AgentCreateRequest>(emptyDraft());

  // --- Photo state (held in memory during creation) ---
  readonly photoFile = signal<File | null>(null);
  readonly photoPreview = signal<string | null>(null);

  /** Id de l'agent existant quand on est en mode edit/view. */
  readonly agentId = signal<number | null>(null);

  readonly canSubmit = computed(() => {
    const d = this.draft();
    if (!d.nom || !d.prenom || !d.cin) return false;
    if (this.mode() === 'create') {
      if (!d.matricule?.trim() || !d.dateRecrutement || !d.domaine?.trim()
          || !d.sousDomaine?.trim() || !d.categorie?.trim() || !d.typeContrat?.trim()) {
        return false;
      }
    } else if (!d.matriculeId) {
      return false;
    }
    // Mirror backend rule: if married, conjoint info is required.
    if (d.situation === 'M' && !d.conjoint) return false;
    return true;
  });

  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  /** Met à jour une portion du draft (merge superficiel). */
  patchDraft(patch: Partial<AgentCreateRequest>): void {
    this.draft.update(d => ({ ...d, ...patch }));
    if (this.mode() === 'create') {
      this.schedulePersist();
    }
  }

  setMatricule(m: Matricule | null): void {
    this.selectedMatricule.set(m);
    this.patchDraft({
      matriculeId: m?.id ?? null,
    });
  }

  loadFromAgent(full: AgentFullDto): void {
    this.agentId.set(full.id);
    this.selectedMatricule.set(full.matricule);
    this.draft.set({
      matriculeId: full.matricule?.id ?? null,
      matricule: full.matricule?.matricule ?? '',
      dateRecrutement: full.matricule?.dateRecrutement ?? '',
      domaine: full.matricule?.domaine ?? '',
      sousDomaine: full.matricule?.sousDomaine ?? '',
      categorie: full.matricule?.categorie ?? '',
      typeContrat: full.matricule?.typeContrat ?? '',
      nom: full.nom,
      prenom: full.prenom,
      cin: full.cin,
      sexe: full.sexe,
      situation: full.situation,
      dateNaissance: full.dateNaissance,
      nomTuteurAr: full.nomTuteurAr,
      prenomTuteurAr: full.prenomTuteurAr,
      pprTuteur: full.pprTuteur,
      dateTutorat: full.dateTutorat,
      numEnfant: full.numEnfant,
      adresses: full.adresses ?? [],
      coordonneesBancaires: full.coordonneesBancaires,
      coordonneesProfessionnelles: full.coordonneesProfessionnelles,
      conjoint: full.conjoint ?? null,
      enfants: full.enfants ?? [],
    });
  }

  reset(): void {
    this.mode.set('create');
    this.activeStep.set(1);
    this.selectedMatricule.set(null);
    this.agentId.set(null);
    this.photoFile.set(null);
    this.photoPreview.set(null);
    this.draft.set(emptyDraft());
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    localStorage.removeItem(this.STORAGE_KEY);
  }

  goToStep(step: number): void {
    this.activeStep.set(step);
  }

  private schedulePersist(): void {
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.draft()));
      } catch {
        // quota dépassé: ignore silencieusement
      }
    }, 500);
  }
}
