import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();

    if (authToken && req.url.startsWith('/api')) {
      // Check token expiration
      if (this.isTokenExpired(authToken)) {
        this.authService.logout();
        this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
        return throwError(() => new Error('Token expired'));
      }

      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });

      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
            console.error('AuthInterceptor: Unauthorized request (401). Logging out.');
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return Math.floor(new Date().getTime() / 1000) >= expiry;
    } catch (e) {
      return true;
    }
  }
}