import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Ranking {
  private http = inject(HttpClient);
  getRanking(id: number) {
  // On envoie un objet { stagiaire_id: id } dans le body
  return this.http.post('http://localhost:8000/ranking/' + id, { stagiaire_id: id });
}
}
