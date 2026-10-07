import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Candidature {
  id_candidature: number;
  id_stagiaire: number;
  id_projet: number;
  statut_candidature: string;
  date_candidature: Date;
  projet?: any; // Optionnel : pour charger les détails du projet lié
}

@Injectable({
  providedIn: 'root'
})
export class CandidaturesService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/candidature';

  /**
   * Récupère les candidatures de l'utilisateur connecté (Stagiaire ou Encadrant)
   */
  getMesCandidatures(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.API_URL + '/me');
  }

  /**
   * Envoie une nouvelle candidature pour un projet
   */
  postuler(idProjet: number): Observable<Candidature> {
    // Le backend récupère l'ID du stagiaire via le Token JWT (userId)
    return this.http.post<Candidature>(this.API_URL, { id_projet: idProjet });
  }

  /**
   * (Admin/Encadrant) Valider une candidature
   */
  accepterCandidature(id: number): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}/accepter`, {});
  }
}