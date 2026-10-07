import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; // 👈 Ajouté
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router); // 👈 Ajouté
  const token = localStorage.getItem('token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ne pas essayer de refresh sur les routes d'auth elles-mêmes
      const isAuthPath = req.url.includes('/auth/');

      if (error.status === 401 && !isAuthPath) {
        console.warn('⚠️ Session expirée, rafraîchissement...');

        return authService.refreshTokens().pipe(
          switchMap((res) => {
            // 💡 Vérifie bien si ton backend renvoie accessToken ou access_token
            const newToken = res.accessToken || res.access_token; 

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });

            return next(retryReq);
          }),
          catchError((err) => {
            console.error('❌ Session perdue');
            authService.logout();
            router.navigate(['/login']); // 👈 Force le retour au login
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};