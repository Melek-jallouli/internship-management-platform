import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly apiUrl = 'http://localhost:3000/ai';

  constructor(private http: HttpClient) {}

  // Analyse de CV (Upload de fichier)
  filtrerCv(file: File, description: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description_poste', description);
    return this.http.post(`${this.apiUrl}/filtrer-cv`, formData);
  }

  // Chatbot
  askChatbot(question: string): Observable<{ reponse: string }> {
    return this.http.post<{ reponse: string }>(`${this.apiUrl}/chat`, { question });
  }

  // Estimation de tâche
  estimerTache(description: string, consomme: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/estimer-tache`, { description, consomme });
  }

  analyserTachesIA(id_pfe: number): Observable<any> {
  const formData = new FormData();
  formData.append('id_pfe', id_pfe.toString());
  // On passe le nombre de jours depuis le début (exemple statique pour le test)
  formData.append('jours_ecoules', '30'); 

  return this.http.post('http://localhost:8000/analyser-taches-suivi', formData);
}
}