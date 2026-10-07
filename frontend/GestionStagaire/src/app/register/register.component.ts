import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private AuthService = inject(AuthService);

  user = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    type_utilisateur: ''
  };

    registerForm: FormGroup = this.fb.group({
      // Données communes (Table Utilisateur)
      email: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(6)]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      type_utilisateur: ['STAGIAIRE'],

      // Données spécifiques (Tables de profils)
      profilData: this.fb.group({
        etablissement_scolaire: [''],
        niveau: [''],
        etablissement: [''],
        departement: [''],
        grade: [''],
        entreprise: [''],
        poste: [''],
        annees_experience: [''],
        specialite: [''],
  })
    });

  onSubmit() {
  if (this.registerForm.valid) {
    // Cette ligne récupère TOUT le formulaire avec la structure imbriquée
    const payload = this.registerForm.value; 

    // console.log pour vérifier la structure dans ton navigateur
    console.log('Structure envoyée :', payload);

    this.AuthService.register(payload).subscribe({
      next: (res) => {
        console.log('Inscription réussie !', res);
        this.router.navigate(['/login']);
      },
      error: (err) => console.error('Erreur inscription', err)
    });
  }
}

}