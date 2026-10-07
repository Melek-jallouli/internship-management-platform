import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, throwError, of } from 'rxjs';

export interface Projet {
  id_projet?: number;
  titre: string;
  description: string;
  technologies: string;
  duree: string;
  date_debut: string;
  statut: string;
  id_encadrant_pro?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjetsService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // Injection de l'ID de la plateforme
  private readonly API_URL = 'http://localhost:3000/projets';

  /**
   * Récupère le token de manière sécurisée (Navigateur uniquement)
   */
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    
    // On vérifie si on est bien côté client avant d'accéder au localStorage
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  /**
   * Méthode pour créer un projet (Utilisée par l'Admin)
   */
  createProject(projetData: Projet): Observable<Projet> {
    const headers = this.getAuthHeaders();

    return this.http.post<Projet>(this.API_URL, projetData, { headers }).pipe(
      catchError(error => {
        console.error('Erreur lors de la création du projet:', error);
        return throwError(() => new Error('Erreur lors de la création. Vérifiez vos droits Admin.'));
      })
    );
  }

  /**
   * Récupère tous les projets disponibles
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
   * Récupère les projets d'un encadrant
   */
  getProjectsByEncadrant(idEncadrant: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.API_URL}/encadrant/${idEncadrant}`);
  }

  deleteProject(id: number): Observable<void> {
  return this.http.delete<void>(`http://localhost:3000/projet/${id}`);
}

updateProject(id: number, projectData: Partial<Projet>): Observable<Projet> {
    // On utilise PATCH pour une mise à jour partielle (plus flexible)
    return this.http.patch<Projet>(`${this.API_URL}/${id}`, projectData);
  }

}