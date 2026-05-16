export interface Poste {
  id: number;
  codeCourt: string;
  dateCreation: string | any;
  libelleDuPoste: string;

  uniteStructurelleId?: number | null;
  uniteStructurelleLibelle?: string;

  fonctionId?: number | null;
  fonctionLibelle?: string;

  posteTravailId?: number | null;
  posteTravailDesignation?: string;
}
