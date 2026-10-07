import { Component, NgZone, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProjetsService, Projet } from './project-list';
import { CandidaturesService, Candidature } from '../condidature/condidature';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.component.html'
})
export class ProjectsListComponent implements OnInit {
  private projetsService = inject(ProjetsService);
  private candidaturesService = inject(CandidaturesService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef); // Ajouté pour forcer le rafraîchissement au besoin
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  projets: Projet[] = [];
  mesCandidatures: Candidature[] = [];
  chargement: boolean = true;
  selectedProjectId: number | null = null;
  showEditModal: boolean = false;
  /*projectForm = new FormGroup({
  titre: new FormControl(''),
  description: new FormControl(''),
  technologies: new FormControl('')
});*/

  ngOnInit() {
    // ⚠️ ON NE CHARGE LES DONNÉES QUE DANS LE NAVIGATEUR
    if (isPlatformBrowser(this.platformId)) {
      this.chargerDonnees();
    }
  }

  chargerDonnees() {
    this.chargement = true;
    
    // On lance le chargement des projets
    this.projetsService.getAvailableProjects().subscribe({
      next: (data: Projet[]) => {
        // On exécute tout ce qui touche à l'UI dans la Zone Angular
        this.zone.run(() => {
          console.log('--- DEBUG PROJECTS ---', data);
          
          // Extraction sécurisée des données
          this.projets = data;

          // Une fois les projets reçus, on charge les candidatures
          this.chargerMesCandidatures();
        });
      },
      error: (err) => {
        console.error('Erreur Projets:', err);
        this.zone.run(() => this.chargement = false);
      }
    });
  }

  postulerAuProjet(projet: any) {
  this.router.navigate(['/cv-deploy'], { 
    state: { data: projet } 
  });
}

  private chargerMesCandidatures() {
    this.candidaturesService.getMesCandidatures().subscribe({
      next: (candidatures) => {
        this.zone.run(() => {
          this.mesCandidatures = candidatures || [];
          this.chargement = false; // Le chargement s'arrête VRAIMENT ici
          
          // On force Angular à vérifier les changements pour stopper l'animation
          this.cdr.detectChanges(); 
          console.log('Données totalement chargées');
        });
      },
      error: (err) => {
        console.error('Erreur Candidatures:', err);
        this.zone.run(() => this.chargement = false);
      }
    });
  }

  // --- LOGIQUE MÉTIER ---

  aDejaPostule(idProjet: number): boolean {
    return this.mesCandidatures.some(c => Number(c.id_projet) === Number(idProjet));
  }

  estDejaAffecte(): boolean {
    return this.mesCandidatures.some(c => c.statut_candidature === 'ACCEPTE');
  }

  postuler(idProjet: number) {
    if (this.estDejaAffecte()) {
      alert("Vous avez déjà un projet validé (ACCEPTE).");
      return;
    }

    if (this.aDejaPostule(idProjet)) {
      alert("Vous avez déjà postulé à ce projet.");
      return;
    }

    this.candidaturesService.postuler(idProjet).subscribe({
      next: () => {
        alert("Candidature envoyée avec succès !");
        this.chargerDonnees(); // Recharge tout proprement
      },
      error: (err) => {
        const msg = err.error?.message || "Erreur lors de l'envoi de la candidature.";
        alert(msg);
      }
    });
  }

}