export interface Prime {
  id: number;

  agentId: number;
  agentNom?: string;
  agentPrenom?: string;
  agentMatricule?: string;
  dateDebut: string;
  dateFin: string;

  codeCentre: string;
  temoinGeneral?: string;

  primeBase?: number;
  primeResponsabilite?: number;
  primeComplementaire?: number;
  primeForfaitaire?: number;
  primeFinCarriere?: number;

  montantPrimeNette?: number;
  montantPrimeBrute?: number;
}
