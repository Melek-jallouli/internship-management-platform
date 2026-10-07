import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core'; // Ajout de PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Ajout de isPlatformBrowser
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EntretienService } from '../entretien-form/entretien.service';
import { AuthService } from '../services/auth.service';
import { DashboardService, DashboardStats } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private entretienService = inject(EntretienService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID); // Injection de la plateforme
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  status: string = 'Chargement...';
  nbProjets: number = 0;
  prochaineReunion: any = null;
  

  ngOnInit(): void {
    // 🛡️ ON NE TOUCHE PAS AU LOCALSTORAGE SUR LE SERVEUR
    if (isPlatformBrowser(this.platformId)) {
      this.initialiserDashboard();
    }
  }

  private initialiserDashboard() {
    const userId = this.authService.getUserId();

    if (userId) {
      console.log("Dashboard chargé pour l'utilisateur :", userId);
      this.loadData(userId);
    } else {
      // Si on est dans le navigateur et qu'il n'y a vraiment pas d'ID
      console.warn("Utilisateur non trouvé dans le navigateur. Redirection...");
      this.router.navigate(['/login']);
    }
  }

  private loadData(userId: number) {
    // 1. Récupérer le statut et le nombre de projets
    this.dashboardService.getStats(userId).subscribe({
      next: (res: DashboardStats) => {
        this.status = res.status;
        this.nbProjets = res.nbProjets;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur stats", err)
    });

    // 2. Récupérer la prochaine réunion (Déjà en place dans ton code)
    this.entretienService.findAllByStagiaire(userId).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // On prend la réunion la plus proche (index 0 si trié par date en SQL)
          this.prochaineReunion = data[0]; 
        }
      }
    });
  }

  rejoindreAppel(roomName: string): void {
    this.router.navigate(['/meeting', roomName]);
  }

  goToCv(): void {
    this.router.navigate(['/stagiaire/cv-deploy']);
  }

  traduireStatut(s: string) : string {
  const labels : Record<string, string> = {
    'EN_ATTENTE': '⏳ En attente de validation',
    'ACCEPTE': '✅ Dossier accepté',
    'EN_STAGE': '🚀 En cours de stage',
    'TERMINE': '🎓 Stage terminé'
  };
  return labels[s] || s;
}


}