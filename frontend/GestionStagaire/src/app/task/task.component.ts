import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EncadrantAcad, EncadrantPro, Stagiaire } from '../pfe-list/pfe-list.component';
import { Projet } from '../add-project/add-project.service';
import { AiService } from '../chat-bot/ai.service';

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

export interface PFE {
  id: number;
  id_candidature: number;
  id_stagiaire: number;
  id_projet: number;
  id_encadrant_pro: number | null;
  id_encadrant_acad: number | null;
  // Relations pour l'affichage
  stagiaire?: Stagiaire;
  projet?: Projet;
  encadrantPro?: EncadrantPro;
  encadrantAcad?: EncadrantAcad;
}

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task.component.html'
})
export class TaskComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  tasks = signal<Task[]>([]);
  assignedPfes = signal<PFE[]>([]);
  showTaskModal = signal(false);
  private aiService = inject(AiService);
  aiAnalysis = signal<any>(null);

  // Initialisation propre du formulaire
  newTask = {
    id_pfe: null as number | null, // Important : commence à null
    titre: '',
    description: '',
    date_limite: '',
    priorite: 'MOYENNE' as const
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
    }
  }

  loadInitialData() {
    // 1. Charger les stagiaires (PFEs) pour la liste déroulante
    this.http.get<PFE[]>('http://localhost:3000/pfe/my-interns').subscribe({
      next: (data) => {
        console.log('Stagiaires chargés :', data);
        this.assignedPfes.set(data);
      },
      error: (err) => console.error('Erreur PFEs:', err)
    });

    // 2. Charger les tâches existantes
    this.loadTasks();
  }

  loadTasks() {
    this.http.get<Task[]>('http://localhost:3000/tasks').subscribe({
      next: (data) => {
        this.tasks.set(data);
        // Si on a des tâches, on lance l'analyse IA pour le stagiaire actif
        if (data.length > 0) {
           this.triggerAIAnalysis(data[0].id_pfe); 
        }
      }
    });
  }

  triggerAIAnalysis(idPfe: number) {
    this.aiService.analyserTachesIA(idPfe).subscribe({
      next: (analysis) => this.aiAnalysis.set(analysis),
      error: (err) => console.error('IA Error:', err)
    });
  }

  addTask() {
    // Petite vérification avant d'envoyer
    if (!this.newTask.id_pfe || !this.newTask.titre) {
      alert('Veuillez sélectionner un stagiaire et donner un titre.');
      return;
    }

    this.http.post('http://localhost:3000/tasks', this.newTask).subscribe({
      next: () => {
        this.loadTasks(); // Rafraîchir la liste
        this.triggerAIAnalysis(this.newTask.id_pfe!)
        this.showTaskModal.set(false); // Fermer la modal
        this.resetForm(); // Réinitialiser
      },
      error: (err) => console.error('Erreur lors de l\'ajout:', err)
    });
  }

  getPriorityClass(priority: string) {
    switch (priority) {
      case 'HAUTE': return 'bg-red-100 text-red-700';
      case 'MOYENNE': return 'bg-amber-100 text-amber-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  }

  private resetForm() {
    this.newTask = { 
      id_pfe: null, 
      titre: '', 
      description: '', 
      date_limite: '', 
      priorite: 'MOYENNE' 
    };
  }
}