import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID); // 1. Injection de la plateforme

  // 2. ÉTAPE SERVEUR : On laisse passer
  // On ne peut pas vérifier le rôle sur le serveur car localStorage est vide
  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  // 3. ÉTAPE NAVIGATEUR : On fait la vraie vérification
  const expectedRoles = route.data?.['expectedRole'];
  const userRole = authService.getRole();

  console.log('Role attendu:', expectedRoles);
  console.log('Role reçu:', userRole);

  // Si aucun rôle n'est trouvé dans le navigateur
  if (!userRole) {
    console.warn("Aucun rôle trouvé, redirection login...");
    router.navigate(['/login']);
    return false;
  }

  // Vérification si le rôle reçu fait partie des rôles autorisés
  if (Array.isArray(expectedRoles) && expectedRoles.includes(userRole)) {
    return true;
  }

  console.error('⛔ Accès refusé : Rôle inadéquat');
  router.navigate(['/login']);
  return false;
};