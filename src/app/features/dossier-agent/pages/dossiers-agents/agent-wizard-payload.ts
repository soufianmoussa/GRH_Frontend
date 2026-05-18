import {
  AdresseDto,
  AgentCreateRequest,
  ConjointDto,
  CoordonneesBancairesDto,
  CoordonneesProfessionnellesDto,
  EnfantDto,
} from '../../../../models/agent-full.model';

type DateLike = Date | string | null | undefined;

const blankToNull = (val: string | null | undefined): string | null => {
  if (val == null) return null;
  return val.trim() === '' ? null : val;
};

const toIsoDate = (value: DateLike): string | null => {
  if (!value) return null;
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = value.trim();
  if (str === '') return null;
  return str.includes('T') ? str.split('T')[0] : str;
};

const hasAnyValue = (obj: object): boolean =>
  Object.values(obj).some((v) => v != null && v !== '');

/**
 * Transforms the wizard draft into a backend-ready `AgentCreateRequest`:
 *  - empty strings → null
 *  - Date objects → "yyyy-MM-dd"
 *  - sub-entities omitted when entirely blank
 *
 * numEnfant is intentionally NOT sent: the backend derives it from `enfants.size()`.
 */
export function buildAgentPayload(draft: AgentCreateRequest): AgentCreateRequest {
  const enfants: EnfantDto[] = (draft.enfants ?? []).map((e) => ({
    nom: blankToNull(e.nom) ?? undefined,
    prenom: blankToNull(e.prenom) ?? undefined,
    dateNaissance: toIsoDate(e.dateNaissance) ?? undefined,
    sexe: blankToNull(e.sexe) ?? undefined,
    situation: e.situation,
    niveauScolaire: blankToNull(e.niveauScolaire) ?? undefined,
  }));

  const payload: AgentCreateRequest = {
    matriculeId: draft.matriculeId,
    matricule: blankToNull(draft.matricule) ?? undefined,
    dateRecrutement: toIsoDate(draft.dateRecrutement) ?? undefined,
    domaine: blankToNull(draft.domaine) ?? undefined,
    sousDomaine: blankToNull(draft.sousDomaine) ?? undefined,
    categorie: blankToNull(draft.categorie) ?? undefined,
    typeContrat: blankToNull(draft.typeContrat) ?? undefined,
    nom: blankToNull(draft.nom) ?? '',
    prenom: blankToNull(draft.prenom) ?? '',
    cin: blankToNull(draft.cin) ?? '',
    sexe: blankToNull(draft.sexe) ?? undefined,
    situation: draft.situation,
    dateNaissance: toIsoDate(draft.dateNaissance) ?? undefined,
    nomTuteurAr: blankToNull(draft.nomTuteurAr) ?? undefined,
    prenomTuteurAr: blankToNull(draft.prenomTuteurAr) ?? undefined,
    pprTuteur: blankToNull(draft.pprTuteur) ?? undefined,
    dateTutorat: toIsoDate(draft.dateTutorat) ?? undefined,
    enfants,
  };

  const adresses: AdresseDto[] = (draft.adresses ?? [])
    .map((a) => {
      const mapped: AdresseDto = {
        id: a.id,
        type: a.type,
        adresse: blankToNull(a.adresse) ?? undefined,
        codePostal: blankToNull(a.codePostal) ?? undefined,
        localite: blankToNull(a.localite) ?? undefined,
        ville: blankToNull(a.ville) ?? undefined,
        pays: blankToNull(a.pays) ?? undefined,
        telephone: blankToNull(a.telephone) ?? undefined,
      };
      return mapped;
    })
    // Skip rows that are entirely blank except for the type selector.
    .filter((a) => hasAnyValue({ ...a, id: undefined, type: undefined }));
  if (adresses.length > 0) payload.adresses = adresses;

  if (draft.coordonneesBancaires) {
    const b = draft.coordonneesBancaires;
    const cb: CoordonneesBancairesDto = {
      banque: blankToNull(b.banque) ?? undefined,
      compte: blankToNull(b.compte) ?? undefined,
      iban: blankToNull(b.iban) ?? undefined,
      rib: blankToNull(b.rib) ?? undefined,
      dateOuverture: toIsoDate(b.dateOuverture) ?? undefined,
      dateValidite: toIsoDate(b.dateValidite) ?? undefined,
    };
    if (hasAnyValue(cb)) payload.coordonneesBancaires = cb;
  }

  if (draft.coordonneesProfessionnelles) {
    const p = draft.coordonneesProfessionnelles;
    const cp: CoordonneesProfessionnellesDto = {
      emailPro: blankToNull(p.emailPro) ?? undefined,
      telFixe: blankToNull(p.telFixe) ?? undefined,
      telPortable: blankToNull(p.telPortable) ?? undefined,
      bureau: blankToNull(p.bureau) ?? undefined,
    };
    if (hasAnyValue(cp)) payload.coordonneesProfessionnelles = cp;
  }

  if (draft.conjoint) {
    const c = draft.conjoint;
    const conj: ConjointDto = {
      nom: blankToNull(c.nom) ?? undefined,
      prenom: blankToNull(c.prenom) ?? undefined,
      cin: blankToNull(c.cin) ?? undefined,
      pays: blankToNull(c.pays) ?? undefined,
      profession: blankToNull(c.profession) ?? undefined,
      dateNaissance: toIsoDate(c.dateNaissance) ?? undefined,
      lieu: blankToNull(c.lieu) ?? undefined,
      nationalite: blankToNull(c.nationalite) ?? undefined,
      dateSituation: toIsoDate(c.dateSituation) ?? undefined,
      matricule: blankToNull(c.matricule) ?? undefined,
    };
    if (hasAnyValue(conj)) payload.conjoint = conj;
  }

  return payload;
}
