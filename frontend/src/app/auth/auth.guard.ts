// src/app/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
// Nu mai este nevoie de Observable, map, tap dacă nu facem operații asincrone complexe aici

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Redirecționează la pagina de login, salvând URL-ul curent pentru redirectare după login
    console.warn('AuthGuard: User not logged in. Redirecting to /login with returnUrl:', state.url);
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
};
