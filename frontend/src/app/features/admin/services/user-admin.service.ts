import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserUpdateDto } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserAdminService {
  private apiUrl = '/api/users'; // This will be proxied to localhost:8080

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
    // Log the data being sent for debugging
    console.log('Updating user with data:', userData);
    
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

    if (error.error && typeof error.error === 'object' && error.error !== null) {
      // Check for validation errors structure
      if (error.error.fieldErrors) {
        // Spring Boot validation error response
        const fieldErrors = error.error.fieldErrors;
        const errorMessages = Object.entries(fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        userFriendlyErrorMessage = `Erori de validare: ${errorMessages}`;
        detailedErrorMessage = errorMessages;
      } else {
        detailedErrorMessage = 
            (error.error as any).message ||
            (error.error as any).detail ||
            (error.error as any).error?.message ||
            JSON.stringify(error.error);

        if ((error.error as any).message && typeof (error.error as any).message === 'string') {
          userFriendlyErrorMessage = (error.error as any).message;
        }
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