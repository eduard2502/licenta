// src/app/auth/user.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const userGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.role === 'user') {
    return true;
  } else if (authService.isLoggedIn() && authService.role !== 'user') {
    // Utilizator logat dar nu e 'user' (ex: admin)
    console.warn('UserGuard: User is logged in but not a regular user. Role:', authService.role);
    if (authService.role === 'admin') {
      // Poți decide să permiți adminilor accesul sau să îi redirecționezi
      // return true; // Permite adminului să acceseze și paginile de user
      return router.createUrlTree(['/admin']); // Redirecționează adminul la panoul său
    }
    // Alt rol necunoscut, redirecționează la login
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  } else {
    // Utilizator nelogat
    console.warn('UserGuard: User not logged in. Redirecting to /login with returnUrl:', state.url);
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
};
