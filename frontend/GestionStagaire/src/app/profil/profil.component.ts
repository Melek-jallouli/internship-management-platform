import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Utilisateur } from '../pfe-list/pfe-list.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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

@Component({
  selector: 'app-profil',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  profilForm: FormGroup;
  user = signal<Utilisateur[]>([]);
  stagiaire = signal<Stagiaire | null>(null);
  userId: number | null = null;
  private platformId = inject(PLATFORM_ID); // Injection de l'ID de plateforme
  
  // Gestion des messages de retour
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient
  ) {
    // Initialisation du formulaire avec validation
    this.profilForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
    this.initUser();
    }
  }

  /**
   * Récupère l'utilisateur depuis le localStorage (stocké lors du Login)
   */
  initUser() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      this.userId = currentUser.id;
      this.loadProfil();
    } else {
      this.message = "Erreur : Session utilisateur non trouvée.";
      this.isError = true;
    }
  }

  /**
   * Charge les données de profil depuis NestJS
   */
  loadProfil() {
    if (!this.userId) return;

    this.http.get(`http://localhost:3000/users/profil/${this.userId}`)
      .subscribe({
        next: (res: any) => {
          // ✅ Correction de l'erreur Utilisateur[] : 
          // Si le backend renvoie un tableau, on prend le premier élément.
          this.user.set(Array.isArray(res) ? res : [res]);
        },
        error: (err) => {
          console.error("Erreur de chargement profil", err);
          this.isError = true;
          this.message = "Impossible de charger les données du profil.";
        }
      });
  }

  /**
   * Validateur personnalisé : vérifie que les deux mots de passe sont identiques
   */
  passwordMatchValidator(g: FormGroup) {
    const newPass = g.get('newPassword')?.value;
    const confirmPass = g.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  /**
   * Envoie la demande de modification à NestJS
   */
  updatePassword() {
    if (this.profilForm.invalid || !this.userId) return;

    this.isLoading = true;
    const payload = {
      userId: this.userId,
      oldPassword: this.profilForm.value.oldPassword,
      newPassword: this.profilForm.value.newPassword
    };

    this.http.patch('http://localhost:3000/users/update-password', payload)
      .subscribe({
        next: (res: any) => {
          this.message = "Mot de passe modifié avec succès !";
          this.isError = false;
          this.isLoading = false;
          this.profilForm.reset(); // Vide le formulaire après succès
        },
        error: (err) => {
          this.message = err.error?.message || "Erreur lors de la modification.";
          this.isError = true;
          this.isLoading = false;
        }
      });
  }
}