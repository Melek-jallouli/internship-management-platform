// frontend: src/app/services/reunion.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entretien } from '../interfaces/entretien.interface.js'; // Ton interface
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EntretienService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/entretiens';

  // Appelle le Controller NestJS @Get('pfe/:pfeId')
  findAllByPfe(pfeId: number) {
    return this.http.get<Entretien[]>(`${this.apiUrl}/pfe/${pfeId}`);
  }

  // Appelle le Controller NestJS @Post()
  schedule(data: any) {
    return this.http.post<Entretien>(this.apiUrl, data);
  }

  findAllByStagiaire(stagiaireId: number): Observable<Entretien[]> {
  return this.http.get<Entretien[]>(`${this.apiUrl}/stagiaire/${stagiaireId}`);
}
}