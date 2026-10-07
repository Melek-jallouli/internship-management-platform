import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

// Interface pour typer tes projets (basée sur ton entité NestJS)
export interface Projet {
  id_projet: number;
  titre: string;
  description: string;
  technologies?: any;
  etat: string;
  id_encadrant_pro?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetsService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/projets';

  /**
   * Récupère tous les projets disponibles pour les stagiaires
   */
  getAvailableProjects(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.API_URL}/available`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des projets:', error);
        return throwError(() => new Error('Impossible de charger les projets.'));
      })
    );
  }

  /**
   * Récupère un projet spécifique par son ID
   */
  getProjectById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.API_URL}/${id}`);
  }

  /**
   * (Optionnel) Récupère les projets créés par un encadrant spécifique
   */
  getProjectsByEncadrant(idEncadrant: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.API_URL}/encadrant/${idEncadrant}`);
  }

  updateProjet(id: number, data: Partial<Projet>): Observable<Projet> {
  return this.http.patch<Projet>(`http://localhost:3000/projet/${id}`, data);
}
}