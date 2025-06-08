// src/app/auth/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.role === 'admin') {
    return true;
  } else if (authService.isLoggedIn() && authService.role !== 'admin') {
    // Utilizator logat dar nu e admin, redirecționează la pagina lui de user
    console.warn('AdminGuard: User is logged in but not an admin. Redirecting to /user');
    return router.createUrlTree(['/user']); // Sau o pagină 'unauthorized' dedicată
  } else {
    // Utilizator nelogat
    console.warn('AdminGuard: User not logged in. Redirecting to /login with returnUrl:', state.url);
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
};
