// src/app/features/admin/services/order.admin.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../../../shared/models/order.model';
import { OrderStatusUpdate } from '../../../shared/models/order-status-update.model'; // <<< CORECTAT

@Injectable({
  providedIn: 'root'
})
export class OrderAdminService {
  private apiUrl = '/api/orders';

  private http = inject(HttpClient);

  getAllOrders(statusFilter?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (statusFilter && statusFilter.trim() !== '') {
      params = params.set('status', statusFilter);
    }
    return this.http.get<Order[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`)
      .pipe(catchError(this.handleError));
  }

  updateOrderStatus(orderId: number, statusUpdate: OrderStatusUpdate): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/status`, statusUpdate)
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
