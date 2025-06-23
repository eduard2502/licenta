// frontend/src/app/features/user-profile/user-profile.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../../auth/auth.service';

// Define the update DTO interface here if not defined in user.model.ts
export interface UserUpdateDto {
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatarImageBase64?: string | null;
  roles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = '/api/users';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getMyProfile(): Observable<User> {
    // First check if user is logged in
    if (!this.authService.isLoggedIn()) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(catchError(this.handleError));
  }

  updateMyProfile(userData: UserUpdateDto): Observable<User> {
    // Remove undefined values to avoid sending them to the backend
    const cleanedData: any = {};
    
    // Always include email as it's required
    cleanedData.email = userData.email;
    
    // Only include other fields if they have values
    if (userData.fullName !== undefined && userData.fullName !== null) {
      cleanedData.fullName = userData.fullName;
    }
    if (userData.phone !== undefined && userData.phone !== null) {
      cleanedData.phone = userData.phone;
    }
    if (userData.address !== undefined && userData.address !== null) {
      cleanedData.address = userData.address;
    }
    if (userData.avatarImageBase64 !== undefined) {
      cleanedData.avatarImageBase64 = userData.avatarImageBase64;
    }
    // Don't include roles for user's own profile update
    
    return this.http.put<User>(`${this.apiUrl}/me`, cleanedData)
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