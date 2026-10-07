import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CandidaturesService } from './condidature';
import { Candidature } from './condidature';




@Component({
  selector: 'app-condidature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './condidature.component.html',
  styleUrl: './condidature.component.css',
})


export class CondidaturesComponent implements OnInit {
  // 1. Injecter le service au lieu de HttpClient
  private candidatureService = inject(CandidaturesService);

  // 2. Typer le tableau correctement (fini le "any")
  candidatures: Candidature[] = [];

  ngOnInit() {
    this.loadCandidatures();
  }

  loadCandidatures() {
    this.candidatureService.getMesCandidatures().subscribe({
      next: (data) => {
        // Optionnel : filtrer si ton API renvoie toutes les candidatures
        this.candidatures = data.filter(c => c.statut_candidature === 'EN_ATTENTE');
        console.log('Candidatures chargées :', this.candidatures);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des candidatures', err);
      }
    });
  }

  // 3. Ajouter la méthode pour le bouton "Accepter" du HTML
  accepterCandidature(id: number) {
    this.candidatureService.accepterCandidature(id).subscribe({
      next: () => {
        // On rafraîchit la liste pour faire disparaître la candidature acceptée
        this.loadCandidatures();
        alert('Candidature acceptée avec succès !');
      },
      error: (err) => console.error('Erreur lors de l\'acceptation', err)
    });
  }
}