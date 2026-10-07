import { ChangeDetectorRef, Component, inject, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CvService } from './cv-deploy'; // Vérifie que le nom du fichier service est correct
import { Router } from '@angular/router';
import { Projet } from '../project-list/project-list';

export interface RecommandationIA {
  id_projet: number;
  titre: string;
  score_match: number;
}

@Component({
  selector: 'app-cv-deploy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cv-deploy.component.html'
})
export class CvDeployComponent implements OnInit{
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private cvService = inject(CvService);
  // On injecte le PLATFORM_ID pour vérifier si on est sur le navigateur
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  
  // ✅ DÉCLARATION DE LA PROPRIÉTÉ MANQUANTE
  description: string = ""; 
  score: number = 0;

  verdict: string = "";
  projetId: number | null = null;
  recommandation: RecommandationIA | null = null;

  selectedFile: File | null = null;
  idProjetActuel: number | null = null;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error' = 'idle';

 // cv-deploy.component.ts

ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      const idStagiaire = user.id; // Utilisation de 'id' comme vu dans ton log

      if (idStagiaire) {
        console.log("Tentative de récupération du projet pour le stagiaire n°", idStagiaire);
        
        this.cvService.getProjetActuel(idStagiaire).subscribe({
  next: (res) => {
    console.log("Objet reçu du Backend :", res); // 
    if (res) {
      this.idProjetActuel = Number(res.id_projet);
      this.description = res.description; // 
      this.cdr.detectChanges();
    } else {
      console.warn("Aucun projet trouvé pour cet ID");
      this.description = ""; 
    }
  },
  error: (err) => console.error("Erreur de liaison :", err)
});
      }
    }
  }
}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.uploadStatus = 'idle';
    } else {
      alert("Seuls les fichiers PDF sont acceptés.");
      this.selectedFile = null;
    }
  }

  

  onSubmit() {
  const userRaw = localStorage.getItem('user');
  const user = JSON.parse(userRaw || '{}');

  // Utilise 'id' car c'est ce qu'on voit dans ton localStorage
  const userId = parseInt(user.id, 10); 

  console.log("ID envoyé au Backend :", userId);

  if (isNaN(userId)) {
    alert("Erreur : Impossible de récupérer votre ID utilisateur.");
    return;
  }

  if (this.selectedFile && this.idProjetActuel) {
    this.uploadStatus = 'uploading';
    
    // On envoie bien l'ID utilisateur à NestJS
    this.cvService.uploadCv(this.selectedFile, this.description, userId, this.idProjetActuel)
      .subscribe({
        next: (res: any) => { // 👈 On ajoute ": any" ici pour autoriser l'accès aux propriétés
  console.log("Réponse brute reçue :", res);
  
  if (res && res.status === 'success') {
    this.uploadStatus = 'success';
    this.score = res.score;
    this.verdict = res.verdict;
    this.recommandation = res.recommandation;
    console.log("Recommandation reçue :", this.recommandation);
  } else {
    // On utilise l'opérateur ?. pour éviter un crash si message n'existe pas
    alert("Erreur IA : " + (res?.message || "Erreur inconnue"));
    this.uploadStatus = 'error';
  }
  this.cdr.detectChanges();
},
        error: (err) => {
          console.error("Erreur technique :", err);
          this.uploadStatus = 'error';
          this.cdr.detectChanges();
        }
      });
  }
}
}