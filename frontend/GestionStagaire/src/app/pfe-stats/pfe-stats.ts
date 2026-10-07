import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyseSuivi {
  statut: string;
  couleur: string;
  ecart_pourcentage: number;
  progres_theorique: number;
  conseil: string;
  jours_restants_estimes: number;
}

@Injectable({
  providedIn: 'root'
})
export class SuiviService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000'; // Ton URL FastAPI

  analyserAvancement(avance: number, jours: number, total: number = 120): Observable<AnalyseSuivi> {
    // Utilisation de FormData car ton API Python attend du Form(...)
    const formData = new FormData();
    formData.append('avance', avance.toString());
    formData.append('jours_ecoules', jours.toString());
    formData.append('total_jours', total.toString());

    return this.http.post<AnalyseSuivi>(`${this.apiUrl}/analyser-suivi`, formData);
  }
}