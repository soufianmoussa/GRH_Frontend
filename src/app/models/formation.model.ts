export interface Formation {
    id: number;
    agentId: number;
    agentNom: string;
    agentPrenom: string;
    agentMatricule: string;
    intituleStage: string;
    dateDebut: string;
    dateFin: string;
    intituleFormation: string;
    certificateUrl?: string;
    certificateFileName?: string;
}
