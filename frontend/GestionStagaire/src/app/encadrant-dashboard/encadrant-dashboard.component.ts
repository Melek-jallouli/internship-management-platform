import { Component, OnInit, inject, signal, computed, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AnalyseSuivi, SuiviService } from '../pfe-stats/pfe-stats';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encadrant-dashboard.component.html'
})
export class EncadrantDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  constructor(private suiviService: SuiviService) {}
  @ViewChild('burndownChart') chartRef!: ElementRef<HTMLCanvasElement>;
  public chart?: Chart;
  private chartConfig: ChartConfiguration = {
    type: 'line', // ou un ChartType
    data: { datasets: [], labels: [] },
    options: { /* ... */ }
  };

  // Signaux pour les statistiques globales
  totalInterns = signal<number>(0);
  activeProjects = signal<number>(0);
  completedTasks = signal<number>(0);
  totalTasks = signal<number>(0);
  avancementReel: number = 45; // Valeur saisie par l'utilisateur
  resultatExpert?: AnalyseSuivi;
  
  // Calcul du taux de progression global
  globalProgress = computed(() => {
    if (this.totalTasks() === 0) return 0;
    return Math.round((this.completedTasks() / this.totalTasks()) * 100);
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
    this.loadGlobalStats();
    }
  }

  loadGlobalStats() {
    // Appel à un endpoint qui renvoie les stats agrégées pour l'encadrant connecté
    this.http.get<any>('http://localhost:3000/encadrant-pro/stats-globales').subscribe({
      next: (stats) => {
        this.totalInterns.set(stats.totalInterns);
        this.activeProjects.set(stats.activeProjects);
        this.completedTasks.set(stats.completedTasks);
        this.totalTasks.set(stats.totalTasks);
      },
      error: (err) => console.error('Erreur stats dashboard:', err)
    });
  }

  updateGraph(data: AnalyseSuivi): void {
  if (!this.chart) return;

  const label = `Jour ${45}`; // À dynamiser

  // Accès sécurisé aux données
  this.chart.data.labels?.push(label);
  
  // On s'assure que les datasets existent avant de pousser
  if (this.chart.data.datasets.length >= 2) {
    this.chart.data.datasets[0].data.push(this.avancementReel);
    this.chart.data.datasets[1].data.push(data.progres_theorique);

    // Mise à jour visuelle dynamique
    this.chart.data.datasets[0].borderColor = data.couleur;
    this.chart.data.datasets[0].backgroundColor = `${data.couleur}1A`;
  }

  this.chart.update();
}

  calculerSuivi() {
  const joursPasses = 45; // Calculé dynamiquement (Date.now - dateDebutStage)
  
  this.suiviService.analyserAvancement(this.avancementReel, joursPasses).subscribe({
    next: (data) => {
      this.resultatExpert = data;
      this.updateGraph(data); // Méthode pour pousser le nouveau point dans Chart.js
    },
    error: (err) => console.error("Erreur Analyse IA:", err)
  });
}

}