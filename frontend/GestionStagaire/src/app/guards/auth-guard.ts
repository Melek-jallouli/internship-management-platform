import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. Si on est sur le SERVEUR, on laisse passer (on ne redirige pas)
  // Le serveur va générer la page, et le client fera la vérification après.
  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  // 2. Si on est sur le NAVIGATEUR, on fait la vraie vérification
  const userId = authService.getUserId();
  
  if (userId) {
    return true; // Utilisateur connecté, on reste sur l'onglet
  } else {
    // Utilisateur non connecté, on redirige
    return router.createUrlTree(['/login']);
  }
};