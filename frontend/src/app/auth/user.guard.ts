// src/app/auth/user.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const userGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check if user is logged in
  if (!authService.isLoggedIn()) {
    console.warn('UserGuard: User not logged in. Redirecting to /login.');
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // 2. Check if the logged-in user has the 'user' role
  if (authService.role === 'user') {
    return true; // Allow access for regular users
  }

  // 3. If the user is logged in but is not a 'user' (e.g., an admin), redirect them.
  if (authService.role === 'admin') {
    console.warn("UserGuard: Admin attempting to access a user-only route. Redirecting to /admin.");
    return router.createUrlTree(['/admin']);
  }

  // 4. Fallback for any other case (e.g., logged in but no role)
  console.warn(`UserGuard: Access denied for role: ${authService.role}.`);
  return router.createUrlTree(['/']);
};