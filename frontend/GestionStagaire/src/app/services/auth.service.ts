import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private apiUrl = 'http://localhost:3000/auth';

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email,
      mot_de_passe: password
    }).pipe(
      tap((res) => {
        if (!isPlatformBrowser(this.platformId)) return;

        localStorage.setItem('token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        localStorage.setItem('role', res.user.role);

        console.log('✅ Login OK:', res.user.role);
      })
    );
  }

  register(payload: any) {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  logout() {
    // 🛡️ On vérifie si on est bien dans le navigateur avant de toucher au Storage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear(); // Supprime toutes les données de session
      console.log('Session nettoyée avec succès');
    }

    // 🚀 La redirection fonctionne aussi bien sur serveur que sur client
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('user') !== null;
    }
    return false;
  }

  getRole(): string | null {
  if (isPlatformBrowser(this.platformId)) {
    const data = localStorage.getItem('user');
    if (data) {
      const user = JSON.parse(data);
      return user.role; // Vérifie bien que la clé s'appelle 'role' dans ton objet
    }
  }
  return null;
}


getUserId(): number | null {
    // 1. On vérifie si on est bien dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('user');
      if (!data) return null;

      try {
        const user = JSON.parse(data);
        const id = user.id_utilisateur || user.id;
        return id ? Number(id) : null;
      } catch (e) {
        return null;
      }
    }
    
    // 2. Si on est sur le serveur, on renvoie null (ou une valeur par défaut)
    return null;
  }

  refreshTokens() {
    const refreshToken = localStorage.getItem('refresh_token');
    const userId = this.getUserId();

    return this.http.post<any>(`${this.apiUrl}/refresh`, { userId, refreshToken }).pipe(
      tap((tokens) => {
        localStorage.setItem('token', tokens.accessToken);
        localStorage.setItem('refresh_token', tokens.refreshToken);
      })
    );
  }
}