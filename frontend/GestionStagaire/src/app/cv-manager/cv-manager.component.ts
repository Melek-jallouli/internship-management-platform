import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Import indispensable
import { Projet } from '../project-list/project-list';

export interface Utilisateur {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  type_utilisateur: 'STAGIAIRE' | 'ENCADRANT_ACAD' | 'ENCADRANT_PRO' | 'ADMIN';
}


export interface Stagiaire {
  etablissement_scolaire: string; 
  niveau: string;
  utilisateur?: Utilisateur;
}

export interface cv {
  id: number;
  id_stagiaire: number;
  id_projet: number;
  nom_fichier: string;
  score_ia: number;   // Assure-toi que ce champ est présent
  date_analyse?: Date;
  // Tu peux aussi ajouter les champs de l'utilisateur si tu fais une jointure SQL
  nom?: string;       
  prenom?: string;
  date_depot: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'MOYEN';
  taille_fichier: number;
  stagiaire: Stagiaire;
}



@Component({
  selector: 'app-cv-bank',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv-manager.component.html'
})
export class CvManagerComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // Injection de la plateforme
  private cdr = inject(ChangeDetectorRef);
  
  listeCandidats: cv[] = [];
  currentProjectId: number = 12;
  isLoading = false;

  ngOnInit() {
    // On ne charge les CV que si on est dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      this.chargerClassement();
    }
  }

  chargerClassement() {
      this.isLoading = true;
      
      this.http.get<cv[]>(`http://localhost:3000/cv/classement/${this.currentProjectId}`)
        .subscribe({
          next: (data) => {
            this.listeCandidats = data;
            this.isLoading = false;
            this.cdr.detectChanges(); // Forcer le rafraîchissement de l'UI
          },
          error: () => this.isLoading = false
        });
      this.http.get<cv[]>('http://localhost:3000/cv').subscribe({
      next: (data) => {
        this.listeCandidats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Impossible de charger les CV", err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Téléchargement du fichier BLOB
   */
  downloadCv(cv: cv) {
    // Cette fonction est déclenchée par un clic, donc on est 
    // théoriquement sur le navigateur, mais la sécurité est préférable
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get(`http://localhost:3000/cv/download/${cv.id}`, {
      responseType: 'blob' 
    }).subscribe((blob: Blob) => {
      // Manipulation sécurisée du DOM et de l'objet URL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = cv.nom_fichier || 'cv-document.pdf'; 
      
      document.body.appendChild(link); // Bonne pratique : ajouter au body avant le clic
      link.click();
      document.body.removeChild(link); // Nettoyage
      
      window.URL.revokeObjectURL(url);
    });
  }

  updateStatus(id: number, status: string) {
    this.http.patch(`http://localhost:3000/cv/${id}`, { statut: status }).subscribe({
      next: () => this.chargerClassement(),
      error: (err) => console.error("Erreur lors de la mise à jour", err)
    });
  }

  getScoreColor(score: number): string {
  if (score >= 75) {
    return '#10b981'; // Vert émeraude (Excellent match)
  } else if (score >= 40) {
    return '#f59e0b'; // Orange ambre (Match moyen)
  } else {
    return '#ef4444'; // Rouge rose (Faible match)
  }
}

}