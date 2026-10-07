import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Stagiaire {
  private http: any; // Injecte HttpClient ici

  updateStatut(id: number, statut: string) {
  return this.http.patch(`/api/stagiaires/${id}/statut`, { statut });
}
}
