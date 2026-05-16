export interface AccidentMaladie {
  id?: number;
  agentId?: number;
  agentMatricule?: string;
  agentNom?: string;
  agentPrenom?: string;
  categorieMaladie: string;

  dateDebutArret?: string | null;
  dateFinArret?: string | null;
  dateNotification?: string | null;

  caracteristiqueArret?: string | null;
  numConseil?: string | null;
  dateConseil?: string | null;
  dateCommission?: string | null;
}
