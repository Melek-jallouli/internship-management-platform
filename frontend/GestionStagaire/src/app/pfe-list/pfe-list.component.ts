import { Component, OnInit, inject, PLATFORM_ID, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Projet } from '../add-project/add-project.service';
import { CandidaturesService } from '../condidature/condidature';

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

export interface EncadrantPro {
  id_encadrant_pro: number;
  entreprise?: string;
  utilisateur: Utilisateur;
}

export interface EncadrantAcad {
  id_encadrant_acad: number;
  grade?: string;
  utilisateur: Utilisateur;
}



export interface Candidature {
  id_candidature: number;
  id_projet: number;
  id_stagiaire: number;
  statut_candidature: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  // Relations chargées par TypeORM
  stagiaire?: Stagiaire; 
  projet?: Projet;
  cv?: cv;
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
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  taille_fichier: number;
  stagiaire: Stagiaire;
}

@Component({
  selector: 'app-pfe-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pfe-list.component.html'
})
export class PfeListComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private candidaturesService = inject(CandidaturesService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  pfes: PFE[] = [];
  pros: EncadrantPro[] = []; 
  acads: EncadrantAcad[] = []; 
  
  showAssignModal = false;
  selectedPfeId: number | null = null;
  mesCandidatures: Candidature[] = [];

  // Initialisation de l'objet d'assignation
  assignment = {
    encadrantProId: null as number | null
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialData();
    }
  }

  loadInitialData() {
    this.loadPfes();
    this.loadSupervisors();
    this.loadCandidatures();
  }

loadPfes() {
  // On récupère les données de la table PFE (créées après validation)
  this.http.get<PFE[]>('http://localhost:3000/pfe').subscribe({
    next: (data) => {
      this.pfes = data;
      this.cdr.detectChanges();
    },
    error: (err) => console.error('Erreur table PFE:', err)
  });
}

loadCandidatures() {
  // On cible les candidatures avec le statut 'EN_ATTENTE'
  // Adaptez l'URL selon votre route NestJS (ex: /candidatures ou /candidatures/en-attente)
  this.http.get<Candidature[]>('http://localhost:3000/candidature/cand').subscribe({
    next: (data) => {
      // Optionnel : Filtrer côté client si le backend renvoie tout
      this.mesCandidatures = data.filter(c => c.statut_candidature === 'EN_ATTENTE');
      this.cdr.detectChanges();
      console.log('Candidatures chargées:', this.mesCandidatures);
    },
    error: (err) => {
      console.error('Erreur lors du chargement des candidatures:', err);
    }
  });
}

openAssignModal(pfe: PFE) {
    // On stocke l'ID réel du PFE pour le PATCH
    this.selectedPfeId = pfe.id; 

    // Initialisation avec les données de l'objet PFE reçu du serveur
    this.assignment = {
      encadrantProId: pfe.id_encadrant_pro || null
    };

    this.showAssignModal = true;
  }

  confirmAssignment() {
    if (this.selectedPfeId && this.assignment.encadrantProId) {
      
      // Assure-toi que ces clés (encadrantProId) correspondent à ton @Body() dans NestJS
      const payload = {
        encadrantProId: this.assignment.encadrantProId
      };

      this.http.patch(`http://localhost:3000/pfe/${this.selectedPfeId}`, payload)
        .subscribe({
          next: () => {
            this.showAssignModal = false;
            this.loadPfes(); // Recharge la liste pour voir les noms des encadrants apparaître
            alert("Encadrants enregistrés avec succès !");
          },
          error: (err) => {
            console.error("Erreur PATCH:", err);
            alert("Erreur lors de l'assignation. Vérifiez la console.");
          }
        });
    } else {
      alert("Veuillez sélectionner les deux encadrants.");
    }
  }


  loadSupervisors() {
    // On récupère les entités encadrants complètes
    this.http.get<EncadrantPro[]>('http://localhost:3000/encadrant-pro').subscribe(data => this.pros = data);
    this.http.get<EncadrantAcad[]>('http://localhost:3000/encadrants').subscribe(data => this.acads = data);
  }
  
  accepterCandidature(id: number) {
  this.http.patch(`http://localhost:3000/candidature/${id}/accepter`, {}).subscribe({
    next: () => {
      // 1. Recharger les candidatures (elles vont disparaître de la liste du haut car elles sont acceptées)
      this.loadCandidatures(); 
      // 2. Recharger les PFEs (le nouveau PFE va apparaître dans la liste du bas)
      this.loadPfes(); 
      alert("Dossier PFE créé avec succès !");
    }
  });
}

refuserCandidature(id: number) {
  // On demande confirmation avant de refuser
  if (confirm("Êtes-vous sûr de vouloir refuser cette candidature ?")) {
    this.http.patch(`http://localhost:3000/candidature/${id}/refuser`, {}).subscribe({
      next: () => {
        // On recharge uniquement les candidatures 
        // (contrairement à l'acceptation, aucun PFE n'est créé en cas de refus)
        this.loadCandidatures(); 
        alert("La candidature a été refusée.");
      },
      error: (err) => {
        console.error("Erreur lors du refus :", err);
        alert("Une erreur est survenue lors du traitement.");
      }
    });
  }
}

}