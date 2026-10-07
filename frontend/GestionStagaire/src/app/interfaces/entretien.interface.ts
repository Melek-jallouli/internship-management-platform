export interface Entretien {
  id: number;
  titre: string;
  dateDebut: Date | string; // string car le JSON de l'API arrive souvent en format texte
  duree: number;
  roomName: string;
  pfeId?: number; // Optionnel car parfois on ne l'a pas encore
}