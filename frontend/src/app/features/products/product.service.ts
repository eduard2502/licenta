// src/app/features/products/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';

  private http = inject(HttpClient);

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(catchError(this.handleError));
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

 private handleError(error: HttpErrorResponse) {
  let userFriendlyErrorMessage = 'A apărut o problemă. Vă rugăm încercați din nou mai târziu.';
  let detailedErrorMessage = 'Eroare necunoscută.';

  if (error.error) {
    // Caz 1: Eroare este un HttpErrorResponse cu un obiect 'error'
    if (typeof error.error === 'object' && error.error !== null) {
      // Încercăm să extragem un mesaj specific din corpul erorii trimis de backend
      // Acesta ar putea fi error.error.message, error.error.error, error.error.detail, etc.
      // Ajustează în funcție de structura răspunsurilor de eroare de la API-ul tău Spring Boot
      detailedErrorMessage = (error.error as any).message ||  // Cel mai comun
                             (error.error as any).error?.message || // Uneori e imbricat
                             (error.error as any).detail ||
                             JSON.stringify(error.error); // Fallback la JSON string dacă e un obiect complex

      // Poți încerca să faci mesajul user-friendly mai specific dacă backend-ul trimite un mesaj clar
      if ((error.error as any).message && typeof (error.error as any).message === 'string') {
        userFriendlyErrorMessage = (error.error as any).message;
      }

    } else if (typeof error.error === 'string') {
      // Caz 2: Corpul erorii este un simplu string
      detailedErrorMessage = error.error;
      userFriendlyErrorMessage = error.error; // Poate fi afișat direct dacă e relevant
    }
  } else if (error.message) {
    // Caz 3: Eroare client-side sau de rețea (ex: HttpErrorResponse fără error.error, dar cu error.message)
    detailedErrorMessage = error.message;
    if (error.status === 0 || error.status === -1) { // Tipic pentru erori de rețea sau CORS
        userFriendlyErrorMessage = 'Eroare de conexiune cu serverul. Verificați rețeaua.';
    } else {
        userFriendlyErrorMessage = 'A apărut o eroare la procesarea cererii.';
    }
  }

  // Logare detaliată în consola dezvoltatorului
  console.error('------------------------------------');
  console.error(`[SERVICE ERROR] Status: ${error.status} - URL: ${error.url}`);
  console.error('Mesaj detaliat:', detailedErrorMessage);
  console.error('Obiect eroare complet:', error);
  console.error('------------------------------------');

  // Aruncă o eroare care va fi propagată și poate fi prinsă în componentă
  // sau de un error handler global, dacă există.
  // Pentru utilizator, mesajele sunt de obicei afișate prin MatSnackBar în componentă/serviciu.
  return throwError(() => new Error(userFriendlyErrorMessage)); // Trimite un mesaj mai general către UI
}
}
