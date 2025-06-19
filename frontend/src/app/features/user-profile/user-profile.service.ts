// frontend/src/app/features/user-profile/user-profile.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserUpdateDto } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = '/api/users';
  private http = inject(HttpClient);

  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(catchError(this.handleError));
  }

  updateMyProfile(userData: UserUpdateDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, userData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let userFriendlyErrorMessage = 'A apărut o problemă. Vă rugăm încercați din nou mai târziu.';
    
    if (error.error && typeof error.error === 'object' && error.error !== null) {
      if (error.error.fieldErrors) {
        const fieldErrors = error.error.fieldErrors;
        const errorMessages = Object.entries(fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        userFriendlyErrorMessage = `Erori de validare: ${errorMessages}`;
      } else {
        userFriendlyErrorMessage = error.error.message || userFriendlyErrorMessage;
      }
    } else if (typeof error.error === 'string') {
      userFriendlyErrorMessage = error.error;
    } else if (error.message) {
      if (error.status === 0 || error.status === -1) {
        userFriendlyErrorMessage = 'Eroare de conexiune cu serverul.';
      } else if (error.status === 401) {
        userFriendlyErrorMessage = 'Sesiunea a expirat. Te rugăm să te autentifici din nou.';
      } else {
        userFriendlyErrorMessage = `A apărut o eroare (${error.status}): ${error.statusText}`;
      }
    }

    console.error('User Profile Service Error:', error);
    return throwError(() => new Error(userFriendlyErrorMessage));
  }
}