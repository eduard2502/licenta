// src/app/auth/auth.service.ts
import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http'; // Import HttpClient
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, JwtResponse, LoginRequest, SignupRequest } from '../shared/models/user.model'; // Asigură-te că JwtResponse și LoginRequest sunt definite în user.model.ts

export type Role = 'admin' | 'user'; // Tipul Role poate rămâne

// Definim o interfață internă pentru utilizatorul stocat, care poate include token-ul
interface StoredUser extends User {
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth'; // URL-ul de bază pentru autentificare
  private currentUserSubject: BehaviorSubject<StoredUser | null>;
  public user$: Observable<StoredUser | null>;

  // Variabile pentru stocarea cheilor în localStorage/sessionStorage
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUserDetails';


  constructor(
    private router: Router,
    private http: HttpClient, // Injectează HttpClient
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let initialUser: StoredUser | null = null;
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedUserJson = localStorage.getItem(this.USER_KEY);
      if (storedToken && storedUserJson) {
        try {
          initialUser = JSON.parse(storedUserJson) as StoredUser;
          initialUser.token = storedToken; // Adaugă token-ul la obiectul user
        } catch (e) {
          console.error('Eroare la parsarea datelor utilizatorului din localStorage', e);
          localStorage.removeItem(this.TOKEN_KEY);
          localStorage.removeItem(this.USER_KEY);
        }
      }
    }
    this.currentUserSubject = new BehaviorSubject<StoredUser | null>(initialUser);
    this.user$ = this.currentUserSubject.asObservable();
  }

  /**
   * Metodă pentru login.
   * @param username Numele de utilizator.
   * @param password Parola.
   * @returns Un Observable care emite true la succes, false la eșec.
   */
  login(username: string, password: string): Observable<boolean> {
    const loginRequest: LoginRequest = { username, password };
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          // Stochează token-ul și detaliile utilizatorului
          if (response && response.token && response.username) {
            const userDetails: StoredUser = {
              id: response.id,
              username: response.username,
              email: response.email,
              roles: response.roles,
              token: response.token // Include token-ul aici pentru coerență, dar îl stocăm separat
            };
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem(this.TOKEN_KEY, response.token);
              localStorage.setItem(this.USER_KEY, JSON.stringify(userDetails));
            }
            this.currentUserSubject.next(userDetails);
          } else {
            // Dacă răspunsul nu este cel așteptat, considerăm login-ul eșuat
            this.handleLoginError(new Error('Răspuns invalid de la server la login.'));
          }
        }),
        map(response => !!(response && response.token)), // Returnează true dacă există token
        catchError(error => {
          this.handleLoginError(error);
          return of(false); // Returnează false în caz de eroare
        })
      );
  }

  /**
   * Metodă pentru signup (înregistrare).
   * @param signupData Datele pentru înregistrare.
   * @returns Un Observable cu răspunsul de la server (ex: MessageResponse).
   */
  signup(signupData: SignupRequest): Observable<any> { // Tipul răspunsului poate varia
    return this.http.post<any>(`${this.apiUrl}/signup`, signupData)
      .pipe(
        catchError(this.handleError) // Poți avea un handler specific pentru signup dacă e nevoie
      );
  }


  private handleLoginError(error: HttpErrorResponse | Error): void { // Acceptă și Error pentru cazuri non-HTTP
    let detailedErrorMessage = 'Eroare necunoscută la login.';
    let userFriendlyMessage = 'Autentificare eșuată. Verificați credențialele sau încercați mai târziu.';

    if (error instanceof HttpErrorResponse) {
        if (error.error && typeof error.error === 'object' && error.error !== null) {
            detailedErrorMessage = (error.error as any).message || JSON.stringify(error.error);
            if ((error.error as any).message) {
                userFriendlyMessage = (error.error as any).message; // Folosește mesajul de la server dacă e relevant
            }
        } else if (typeof error.error === 'string') {
            detailedErrorMessage = error.error;
            userFriendlyMessage = error.error;
        } else {
            detailedErrorMessage = `Status: ${error.status}, Mesaj: ${error.message}`;
        }
         if (error.status === 401) { // Unauthorized
            userFriendlyMessage = 'Nume de utilizator sau parolă incorectă.';
        } else if (error.status === 0 || error.status === -1) {
            userFriendlyMessage = 'Eroare de conexiune cu serverul de autentificare.';
        }

    } else if (error instanceof Error) { // Eroare non-HTTP pasată manual
        detailedErrorMessage = error.message;
        userFriendlyMessage = error.message; // Poate fi un mesaj specific cum ar fi "Răspuns invalid"
    }

    console.error('------------------------------------');
    console.error('[LOGIN ERROR] Mesaj detaliat:', detailedErrorMessage);
    console.error('Obiect eroare complet:', error);
    console.error('------------------------------------');

    // Curăță starea de autentificare
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);

    // Nu arunca o eroare aici dacă vrei ca Observable-ul de login să returneze false
    // și să gestionezi afișarea mesajului în componentă sau în subscribe-ul din AuthService.login
    // Dacă arunci eroarea, subscribe-ul din login va intra pe ramura 'error'.
}


  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem(this.TOKEN_KEY) && !!this.currentUserSubject.value;
    }
    return false;
  }

  get role(): Role | null {
    const user = this.currentUserSubject.value;
    if (user && user.roles && user.roles.length > 0) {
      // Presupunem că un utilizator are un singur rol principal relevant pentru guard-uri
      // sau că primul rol este cel mai important. Adaptează logica dacă e necesar.
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
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private handleError(error: HttpErrorResponse) {
  let userFriendlyErrorMessage = 'A apărut o problemă. Vă rugăm încercați din nou mai târziu.';
  let detailedErrorMessage = 'Eroare necunoscută.';

  // Verificăm mai întâi dacă 'error.error' există și este un obiect (răspuns JSON de la server)
  if (error.error && typeof error.error === 'object' && error.error !== null) {
    // Încercăm să extragem un mesaj specific din corpul erorii trimis de backend
    // Acesta ar putea fi error.error.message, error.error.error, error.error.detail etc.
    // Ajustează în funcție de structura răspunsurilor de eroare de la API-ul tău Spring Boot
    detailedErrorMessage = 
        (error.error as any).message ||         // Cel mai comun (ex: MessageResponse din Spring)
        (error.error as any).detail ||          // Alt câmp comun pentru detalii eroare
        (error.error as any).error?.message ||  // Uneori eroarea e imbricată
        JSON.stringify(error.error);            // Fallback la JSON string dacă e un obiect complex

    // Poți încerca să faci mesajul user-friendly mai specific dacă backend-ul trimite un mesaj clar
    if ((error.error as any).message && typeof (error.error as any).message === 'string') {
      userFriendlyErrorMessage = (error.error as any).message;
    }
  } else if (typeof error.error === 'string') {
    // Corpul erorii de la server este un simplu string
    detailedErrorMessage = error.error;
    userFriendlyErrorMessage = error.error; 
  } else if (error.message) {
    // Eroare client-side sau de rețea (ex: HttpErrorResponse fără error.error, dar cu error.message)
    detailedErrorMessage = error.message;
    if (error.status === 0 || error.status === -1) { // Tipic pentru erori de rețea, CORS, sau server oprit
        userFriendlyErrorMessage = 'Eroare de conexiune cu serverul. Verificați rețeaua sau dacă serverul backend rulează.';
    } else {
        userFriendlyErrorMessage = `A apărut o eroare (${error.status}): ${error.statusText}`;
    }
  } else {
    // Fallback dacă structura erorii nu este cea așteptată
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

  // Aruncă o eroare care va fi propagată și poate fi prinsă în componentă
  // sau de un error handler global, dacă există.
  // Pentru utilizator, mesajele sunt de obicei afișate prin MatSnackBar în componentă/serviciu.
  return throwError(() => new Error(userFriendlyErrorMessage));
}
}
