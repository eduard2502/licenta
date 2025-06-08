// src/app/auth/auth.interceptor.ts
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
import { AuthService } from './auth.service'; // Asigură-te că AuthService are o metodă getToken()
import { Router } from '@angular/router';

/**
 * Interceptor HTTP pentru a adăuga automat token-ul JWT la request-urile către API-ul protejat
 * și pentru a gestiona erorile 401 (Unauthorized).
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Folosim inject pentru a injecta dependențele într-o clasă non-componentă
  private authService = inject(AuthService);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();

    // Clonează request-ul și adaugă header-ul de autorizare dacă token-ul există
    // și dacă request-ul este către API-ul tău (verifică dacă URL-ul începe cu '/api')
    // Poți face această verificare mai robustă dacă API-ul tău e pe alt domeniu.
    if (authToken && req.url.startsWith('/api')) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });

      // Trimite request-ul clonat cu header-ul de autorizare
      // și gestionează erorile specifice de autentificare
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Eroare 401: Unauthorized (token invalid, expirat, sau lipsă permisiuni)
            // Deloghează utilizatorul și redirecționează la pagina de login.
            // Poți adăuga și un query param pentru a afișa un mesaj specific pe pagina de login.
            this.authService.logout(); // AuthService ar trebui să curețe token-ul și starea user-ului
            this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
            console.error('AuthInterceptor: Unauthorized request (401). Logging out.');
          }
          // Propagă eroarea mai departe pentru a fi gestionată de alte error handlers sau în componentă.
          return throwError(() => error);
        })
      );
    }

    // Pentru request-uri care nu necesită token sau nu sunt către API-ul tău, trimite-le neschimbate.
    return next.handle(req);
  }
}
