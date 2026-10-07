import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; // Import indispensable
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, finalize } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); // Injecter la plateforme
  private cdr = inject(ChangeDetectorRef);
  
  stats = { totalStagiaires: 0, totalEncadrants: 0, pfesEnAttente: 0, projetsActifs: 0 };
  recentUsers: any[] = [];
  loading = true;

  ngOnInit() {
    // PROTECTION SSR : On ne lance les requêtes de données que côté navigateur
    // pour éviter que le serveur ne reste bloqué si l'API met du temps à répondre
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    } else {
      this.loading = false; // On arrête le loading côté serveur pour afficher le squelette
    }
  }

  loadDashboardData() {
    this.loading = true;
    
    forkJoin({
      users: this.http.get<any[]>('http://localhost:3000/users').pipe(catchError(() => of([]))),
      pfes: this.http.get<any[]>('http://localhost:3000/pfe').pipe(catchError(() => of([]))),
      projets: this.http.get<any[]>('http://localhost:3000/projets/available').pipe(catchError(() => of([])))
    })
    .pipe(
      finalize(() => this.loading = false) // S'assure que loading passe à false même en cas d'erreur
    )
    .subscribe({
      next: (res) => {
        // 1. Calcul des stats globales
        this.stats.totalStagiaires = res.users.filter(u => u.type_utilisateur === 'STAGIAIRE').length;
        this.stats.totalEncadrants = res.users.filter(u => 
          u.type_utilisateur === 'ENCADRANT_PRO' || u.type_utilisateur === 'ENCADRANT_ACAD'
        ).length;
        this.stats.pfesEnAttente = res.pfes.filter(p => p.statut === 'A_VALIDER').length;
        this.stats.projetsActifs = res.projets.length;

        // 2. On trie par ID décroissant et on prend les 5 derniers
        this.recentUsers = [...res.users]
          .sort((a, b) => (b.id_utilisateur || b.id) - (a.id_utilisateur || a.id)) 
          .slice(0, 5);
        this.cdr.detectChanges(); // Forcer la détection de changements après les mises à jour
      },
      error: (err) => {
        console.error("Erreur Dashboard:", err);
      }
    });
  }

  logout() {
    // PROTECTION SSR : localStorage n'existe pas sur le serveur
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}