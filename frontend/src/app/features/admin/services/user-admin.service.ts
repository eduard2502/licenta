// src/app/features/admin/services/user-admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserUpdateDto } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private apiUrl = '/api/users';

  private http = inject(HttpClient);

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  updateUser(userId: number, userData: UserUpdateDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData)
      .pipe(catchError(this.handleError));
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
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
