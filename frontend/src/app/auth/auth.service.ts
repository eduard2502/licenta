import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, JwtResponse, LoginRequest, SignupRequest } from '../shared/models/user.model';

export type Role = 'admin' | 'user';

interface StoredUser extends User {
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSubject: BehaviorSubject<StoredUser | null>;
  public user$: Observable<StoredUser | null>;

  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUserDetails';
  private readonly REMEMBER_KEY = 'rememberMe';

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let initialUser: StoredUser | null = null;
    if (isPlatformBrowser(this.platformId)) {
      // Check if user chose to be remembered
      const rememberMe = localStorage.getItem(this.REMEMBER_KEY) === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;
      
      const storedToken = storage.getItem(this.TOKEN_KEY);
      const storedUserJson = storage.getItem(this.USER_KEY);
      
      if (storedToken && storedUserJson) {
        try {
          // Check token expiration
          if (!this.isTokenExpired(storedToken)) {
            initialUser = JSON.parse(storedUserJson) as StoredUser;
            initialUser.token = storedToken;
          } else {
            // Token expired, clear storage
            this.clearStorage();
          }
        } catch (e) {
          console.error('Eroare la parsarea datelor utilizatorului din storage', e);
          this.clearStorage();
        }
      }
    }
    this.currentUserSubject = new BehaviorSubject<StoredUser | null>(initialUser);
    this.user$ = this.currentUserSubject.asObservable();
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

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Clear from both storages
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.REMEMBER_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    }
  }

  login(username: string, password: string, rememberMe: boolean = false): Observable<boolean> {
    const loginRequest: LoginRequest = { username, password };
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response && response.token && response.username) {
            const userDetails: StoredUser = {
              id: response.id,
              username: response.username,
              email: response.email,
              roles: response.roles,
              token: response.token
            };
            if (isPlatformBrowser(this.platformId)) {
              const storage = rememberMe ? localStorage : sessionStorage;
              storage.setItem(this.TOKEN_KEY, response.token);
              storage.setItem(this.USER_KEY, JSON.stringify(userDetails));
              
              // Store remember me preference
              if (rememberMe) {
                localStorage.setItem(this.REMEMBER_KEY, 'true');
              } else {
                localStorage.removeItem(this.REMEMBER_KEY);
              }
            }
            this.currentUserSubject.next(userDetails);
          } else {
            this.handleLoginError(new Error('Răspuns invalid de la server la login.'));
          }
        }),
        map(response => !!(response && response.token)),
        catchError(error => {
          this.handleLoginError(error);
          return of(false);
        })
      );
  }

  signup(signupData: SignupRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, signupData)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !this.isTokenExpired(this.getToken() || '');
  }

  get role(): Role | null {
    const user = this.currentUserSubject.value;
    if (user && user.roles && user.roles.length > 0) {
      if (user.roles.includes('ROLE_ADMIN')) {
        return 'admin';
      }
      if (user.roles.includes('ROLE_USER')) {
        return 'user';
      }
    }
    return null;
  }

  getCurrentUser(): StoredUser | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      // Check both storages
      return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private handleLoginError(error: HttpErrorResponse | Error): void {
    let detailedErrorMessage = 'Eroare necunoscută la login.';
    let userFriendlyMessage = 'Autentificare eșuată. Verificați credențialele sau încercați mai târziu.';

    if (error instanceof HttpErrorResponse) {
        if (error.error && typeof error.error === 'object' && error.error !== null) {
            detailedErrorMessage = (error.error as any).message || JSON.stringify(error.error);
            if ((error.error as any).message) {
                userFriendlyMessage = (error.error as any).message;
            }
        } else if (typeof error.error === 'string') {
            detailedErrorMessage = error.error;
            userFriendlyMessage = error.error;
        } else {
            detailedErrorMessage = `Status: ${error.status}, Mesaj: ${error.message}`;
        }
         if (error.status === 401) {
            userFriendlyMessage = 'Nume de utilizator sau parolă incorectă.';
        } else if (error.status === 0 || error.status === -1) {
            userFriendlyMessage = 'Eroare de conexiune cu serverul de autentificare.';
        }

    } else if (error instanceof Error) {
        detailedErrorMessage = error.message;
        userFriendlyMessage = error.message;
    }

    console.error('------------------------------------');
    console.error('[LOGIN ERROR] Mesaj detaliat:', detailedErrorMessage);
    console.error('Obiect eroare complet:', error);
    console.error('------------------------------------');

    this.clearStorage();
    this.currentUserSubject.next(null);
  }

  private handleError(error: HttpErrorResponse) {
    let userFriendlyErrorMessage = 'A apărut o problemă. Vă rugăm încercați din nou mai târziu.';
    let detailedErrorMessage = 'Eroare necunoscută.';

    if (error.error && typeof error.error === 'object' && error.error !== null) {
      detailedErrorMessage = 
          (error.error as any).message ||
          (error.error as any).detail ||
          (error.error as any).error?.message ||
          JSON.stringify(error.error);

      if ((error.error as any).message && typeof (error.error as any).message === 'string') {
        userFriendlyErrorMessage = (error.error as any).message;
      }
    } else if (typeof error.error === 'string') {
      detailedErrorMessage = error.error;
      userFriendlyErrorMessage = error.error; 
    } else if (error.message) {
      detailedErrorMessage = error.message;
      if (error.status === 0 || error.status === -1) {
          userFriendlyErrorMessage = 'Eroare de conexiune cu serverul. Verificați rețeaua sau dacă serverul backend rulează.';
      } else {
          userFriendlyErrorMessage = `A apărut o eroare (${error.status}): ${error.statusText}`;
      }
    } else {
      detailedErrorMessage = `Cod eroare server: ${error.status}, status text: ${error.statusText || 'Necunoscut'}`;
      userFriendlyErrorMessage = `A apărut o eroare (${error.status}). Vă rugăm încercați mai târziu.`;
    }

    console.error('------------------------------------');
    console.error(`[SERVICE ERROR ENCOUNTERED]`);
    console.error(`URL: ${error.url}`);
    console.error(`Status: ${error.status} - ${error.statusText}`);
    console.error(`User-Friendly Message: ${userFriendlyErrorMessage}`);
    console.error(`Detailed Error Message/Body: ${detailedErrorMessage}`);
    console.error('Full HttpErrorResponse Object:', error);
    console.error('------------------------------------');

    return throwError(() => new Error(userFriendlyErrorMessage));
  }
}