import { Component, OnInit, ViewChild, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AnalyseSuivi, SuiviService } from './pfe-stats';
import { isPlatformBrowser } from '@angular/common';
Chart.register(...registerables);

@Component({
  selector: 'app-pfe-stats',
  template: `<canvas #burndownChart></canvas>`,
  styles: ['canvas { max-height: 400px; width: 100%; }']
})
export class PfeStatsComponent implements OnInit {
  constructor(private suiviService: SuiviService) {}
    @ViewChild('burndownChart') chartRef!: ElementRef<HTMLCanvasElement>;
    public chart?: Chart;
    private chartConfig: ChartConfiguration = {
      type: 'line', // ou un ChartType
      data: { datasets: [], labels: [] },
      options: { /* ... */ }
    };
    private platformId = inject(PLATFORM_ID);

  // Données simulées (à remplacer par ton appel API Python)
  dataSuivi = [
    { jour: 0, reel: 0, theorie: 0 },
    { jour: 30, reel: 20, theorie: 25 },
    { jour: 60, reel: 35, theorie: 50 },
    { jour: 90, reel: 75, theorie: 75 }
  ];
   avancementReel: number = 45; // Valeur saisie par l'utilisateur
   resultatExpert?: AnalyseSuivi;
    

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
    setTimeout(() => this.createChart(), 100); // Laisse le temps au DOM de charger
  } }

  createChart() {
    const labels = this.dataSuivi.map(d => `Jour ${d.jour}`);
    const valuesReel = this.dataSuivi.map(d => d.reel);
    const valuesTheorie = this.dataSuivi.map(d => d.theorie);

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Avancement Réel (%)',
            data: valuesReel,
            borderColor: '#3b82f6', // Bleu
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Objectif Théorique (%)',
            data: valuesTheorie,
            borderColor: '#94a3b8', // Gris
            borderDash: [5, 5], // Ligne pointillée
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Analyse d\'Avancement du PFE' }
        },
        scales: {
          y: { beginAtZero: true, max: 100, title: { display: true, text: 'Pourcentage' } }
        }
      }
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