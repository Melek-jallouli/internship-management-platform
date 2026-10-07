import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntretienService } from '../entretien-form/entretien.service';
import { AuthService } from '../services/auth.service'; // Pour l'ID du stagiaire
import { Entretien } from '../interfaces/entretien.interface'; // Ton interface
import { EntretienFormComponent } from '../entretien-form/entretien-form.component';

@Component({
  selector: 'app-convention',
  standalone: true,
  imports: [CommonModule, RouterModule, EntretienFormComponent],
  templateUrl: './convention.component.html'
})
export class ConventionComponent implements OnInit {
  private entretiensService = inject(EntretienService);
  private authService = inject(AuthService);

  entretiens: Entretien[] = [];
  loading: boolean = true;
  pfeId: number = 1; // À récupérer dynamiquement selon ton système

  ngOnInit(): void {
    const id = this.authService.getUserId();
    if (id) {
      this.pfeId = id; // On stocke d'abord
      this.chargerEntretiens(); // Puis on appelle sans paramètre
    }
  }

  chargerEntretiens(): void {
    // Note: Dans un vrai projet, on récupère le pfeId depuis l'auth ou le profil
    this.entretiensService.findAllByPfe(this.pfeId).subscribe({
      next: (data: Entretien[]) => {
        this.entretiens = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des entretiens', err);
        this.loading = false;
      }
    });
  }

  // Bonus : Une méthode pour vérifier si la réunion est "Maintenant"
  isLive(dateDebut: Date | string): boolean {
    const start = new Date(dateDebut).getTime();
    const now = new Date().getTime();
    const duration = 30 * 60000; // 30 minutes en millisecondes
    
    return now >= start && now <= (start + duration);
  }
}