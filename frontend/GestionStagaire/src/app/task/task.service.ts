import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PFE } from './task.component';

export interface Task {
  id_task: number;
  id_pfe: number;
  titre: string;
  description: string;
  date_limite: Date;
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE';
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINE';
  pfe?: PFE; // Relation pour affichage
}


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/tasks';

  // Récupérer toutes les tâches de l'encadrant connecté
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.API_URL);
  }

  getMyTasks(): Observable<Task[]> {
  // Le backend filtrera via le JWT du stagiaire
  return this.http.get<Task[]>('http://localhost:3000/tasks/my-tasks');
}

  // Créer une nouvelle tâche
  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.API_URL, task);
  }

  // Optionnel : Mettre à jour le statut (ex: terminer une tâche)
  updateStatus(id: number, statut: string): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${id}/status`, { statut });
  }
}