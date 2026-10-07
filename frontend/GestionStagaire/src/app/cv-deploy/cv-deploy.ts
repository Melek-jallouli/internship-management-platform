import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/cv'; // L'URL de ton backend NestJS

  uploadCv(file: File, description: string, userId: number, idProjet: number) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', description);
  
  // Utilise ces noms EXACTS pour correspondre au body de NestJS
  formData.append('idStagiaire', userId.toString()); 
  formData.append('idProjet', idProjet.toString());

  return this.http.post('http://localhost:3000/cv/upload', formData);
}

  // Optionnel : Récupérer le score du stagiaire plus tard
  getScore(idStagiaire: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/score/${idStagiaire}`);
  }

  getTopCandidats(idProjet: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/classement/${idProjet}`);
  }

getProjetActuel(idStagiaire: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/projet-actuel/${idStagiaire}`);
}
}