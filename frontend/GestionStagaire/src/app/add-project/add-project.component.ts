import { ChangeDetectorRef, Component, inject, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Projet, ProjetsService } from './add-project.service';
import { Candidature, CandidaturesService } from '../condidature/condidature';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-project.component.html'
})
export class AddProjectComponent {
  private projetsService = inject(ProjetsService);
  private candidaturesService = inject(CandidaturesService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef); // Ajouté pour forcer le rafraîchissement au besoin
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  projectForm: FormGroup = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required]],
    technologies: ['', [Validators.required]], // Ex: "Angular, NestJS, MySQL"
    duree: ['', [Validators.required]],
    statut: 'DISPONIBLE'
  });

  projets: Projet[] = [];
  mesCandidatures: Candidature[] = [];
  chargement: boolean = true;
  isEditMode = signal(false); // Pour changer le texte du bouton
  selectedProjectId: number | null = null;
  

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
  onSubmit() {
  // 1. Correction : Si le formulaire est INVALIDE, on s'arrête
  if (this.projectForm.invalid) {
    console.warn("Formulaire invalide");
    return;
  }

  const projectData = this.projectForm.value;

  if (this.isEditMode() && this.selectedProjectId) {
    // --- MODE MODIFICATION ---
    this.projetsService.updateProject(this.selectedProjectId, projectData).subscribe({
      next: () => {
        console.log('Projet mis à jour !');
        this.resetForm();
        this.chargerDonnees(); // Recharge la liste proprement
      },
      error: (err) => alert("Erreur lors de la mise à jour")
    });
  } else {
    // --- MODE AJOUT ---
    this.projetsService.createProject(projectData).subscribe({
      next: (res) => {
        console.log('Projet créé !', res);
        this.resetForm();
        this.chargerDonnees(); // Rafraîchit la liste des projets
      },
      error: (err) => alert("Erreur lors de la création : " + err.message)
    });
  }
}

  onEdit(projet: Projet) {
    this.isEditMode.set(true);
    this.selectedProjectId = projet.id_projet ?? null;

    // On remplit le Reactive Form proprement
    this.projectForm.patchValue({
      titre: projet.titre,
      description: projet.description,
      technologies: projet.technologies,
      duree: projet.duree
    });

    // Scroll vers le haut pour voir le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDelete(idProject: number) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
    this.projetsService.deleteProject(idProject).subscribe({
      next: () => {
        // Optionnel : un petit message de succès (Toast)
        console.log('Projet supprimé');
        
        // On rafraîchit la liste localement
        this.projets = this.projets.filter(p => p.id_projet !== idProject);
        
        // Si on était en train de modifier ce projet précis, on réinitialise le formulaire
        if (this.selectedProjectId === idProject) {
          this.resetForm();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        alert('Impossible de supprimer le projet car il est peut-être lié à un stage en cours.');
      }
    });
  }
}

  resetForm() {
    this.projectForm.reset();
    this.isEditMode.set(false);
    this.selectedProjectId = null;
  }
  
}