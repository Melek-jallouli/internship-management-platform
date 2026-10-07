// dashboard.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface DashboardStats {
  status: string;
  nbProjets: number;
}

@Injectable({ providedIn: 'root' })

export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  getStats(userId: number) {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stagiaires/stats/${userId}`);
  }
}