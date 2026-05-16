import { AgentCreateRequest } from '../../../models/agent-full.model';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (v?: string | null) => v == null || v.trim() === '';

const isFutureDate = (d: unknown): boolean => {
  if (!d) return false;
  const date = d instanceof Date ? d : new Date(d as string);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() > today.getTime();
};

export interface ValidationError {
  key: string;
  params?: any;
}

/**
 * Valide une étape du wizard et renvoie la liste des erreurs.
 */
export function validateStep(step: number, d: AgentCreateRequest): ValidationError[] {
  switch (step) {
    case 1:
      return validateMatricule(d);
    case 2:
      return validateIdentity(d);
    case 3:
      return validateAdresses(d);
    case 4:
      return validatePro(d);
    case 5:
      return validateBank(d);
    case 6:
      return validateFamily(d);
    default:
      return [];
  }
}

function validateMatricule(d: AgentCreateRequest): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.VALIDATION.';
  if (isBlank(d.matricule)) errors.push({ key: p + 'MATRICULE_REQ' });
  if (!d.dateRecrutement) errors.push({ key: p + 'DATE_RECRUT_REQ' });
  if (isBlank(d.domaine)) errors.push({ key: p + 'DOMAINE_REQ' });
  if (isBlank(d.sousDomaine)) errors.push({ key: p + 'SOUS_DOMAINE_REQ' });
  if (isBlank(d.categorie)) errors.push({ key: p + 'CATEGORIE_REQ' });
  if (isBlank(d.typeContrat)) errors.push({ key: p + 'TYPE_CONTRAT_REQ' });
  return errors;
}

function validateIdentity(d: AgentCreateRequest): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.VALIDATION.';
  if (isBlank(d.nom)) errors.push({ key: p + 'NOM_REQ' });
  if (isBlank(d.prenom)) errors.push({ key: p + 'PRENOM_REQ' });
  if (isBlank(d.cin)) errors.push({ key: p + 'CIN_REQ' });
  else if ((d.cin as string).trim().length < 4)
    errors.push({ key: p + 'CIN_MIN' });

  if (!d.sexe) errors.push({ key: p + 'SEXE_REQ' });
  else if (d.sexe !== 'M' && d.sexe !== 'F')
    errors.push({ key: p + 'SEXE_INVALID' });

  if (!d.dateNaissance) errors.push({ key: p + 'DATE_NAISSANCE_REQ' });
  else if (isFutureDate(d.dateNaissance))
    errors.push({ key: p + 'DATE_NAISSANCE_FUTURE' });

  if (isBlank(d.pprTuteur)) errors.push({ key: p + 'PPR_TUTEUR_REQ' });
  if (isBlank(d.nomTuteurAr)) errors.push({ key: p + 'NOM_AR_REQ' });
  if (isBlank(d.prenomTuteurAr)) errors.push({ key: p + 'PRENOM_AR_REQ' });

  return errors;
}

function validateAdresses(d: AgentCreateRequest): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.VALIDATION.';
  const list = d.adresses ?? [];

  list.forEach((a, i) => {
    if (!a.type) {
      errors.push({
        key: p + 'ADRESSE_TYPE_REQ',
        // In the component, we can prefix with "Adresse #i" if needed
      });
    }
  });

  const principales = list.filter((a) => a.type === 'PRINCIPALE').length;
  if (principales > 1)
    errors.push({ key: p + 'ADRESSE_UNIQUE_PRINCIPALE' });

  const counts = new Map<string, number>();
  for (const a of list) {
    if (!a.type || a.type === 'AUTRE') continue;
    counts.set(a.type, (counts.get(a.type) ?? 0) + 1);
  }
  for (const [type, n] of counts) {
    if (n > 1) errors.push({ key: p + 'ADRESSE_DUPLICATE_TYPE', params: { n, type } });
  }

  return errors;
}

function validatePro(d: AgentCreateRequest): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.VALIDATION.';
  const coord = d.coordonneesProfessionnelles;
  if (coord?.emailPro && !EMAIL_RE.test(coord.emailPro.trim()))
    errors.push({ key: p + 'EMAIL_INVALID' });
  return errors;
}

function validateBank(d: AgentCreateRequest): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.VALIDATION.';
  const b = d.coordonneesBancaires;
  if (b?.iban && b.iban.replace(/\s+/g, '').length < 15)
    errors.push({ key: p + 'IBAN_SHORT' });
  return errors;
}

function validateFamily(d: AgentCreateRequest): ValidationError[] {
  const errors: ValidationError[] = [];
  const p = 'GESTION_PERSONNELLE.DOSSIERS_AGENTS.AGENT_WIZARD.VALIDATION.';
  if (d.situation === 'M') {
    if (!d.conjoint) {
      errors.push({ key: p + 'CONJOINT_REQ' });
    } else {
      if (isBlank(d.conjoint.nom)) errors.push({ key: p + 'NOM_REQ' }); // Reusing keys
      if (isBlank(d.conjoint.prenom)) errors.push({ key: p + 'PRENOM_REQ' });
    }
  }

  (d.enfants ?? []).forEach((e, i) => {
    if (isBlank(e.nom)) errors.push({ key: p + 'NOM_REQ' });
    if (isBlank(e.prenom)) errors.push({ key: p + 'PRENOM_REQ' });
    if (isFutureDate(e.dateNaissance))
      errors.push({ key: p + 'DATE_NAISSANCE_FUTURE' });
  });

  return errors;
}

/** Valide le draft complet. */
export function validateAll(d: AgentCreateRequest): ValidationError[] {
  const out: ValidationError[] = [];
  for (let step = 1; step <= 6; step++) out.push(...validateStep(step, d));
  return out;
}
