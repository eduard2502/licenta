// src/app/features/user-dashboard/services/client-order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../../../shared/models/order.model'; // Modelul partajat

/**
 * Serviciu pentru operațiunile clientului legate de comenzi
 * (plasare comandă, vizualizare istoric).
 */
@Injectable({
  providedIn: 'root'
})
export class ClientOrderService {
  // Endpoint-ul pentru comenzile clientului (plasare, istoric propriu)
  private ordersApiUrl = '/api/orders';

  private http = inject(HttpClient);

  /**
   * Plasează o nouă comandă.
   * @param orderData Obiectul Order ce conține detaliile comenzii.
   * @returns Un Observable care emite comanda creată.
   */
  placeOrder(orderData: Order): Observable<Order> {
    // Backend-ul se așteaptă la un OrderDto.
    // Asigură-te că orderData (construit în CheckoutComponent) respectă structura.
    return this.http.post<Order>(this.ordersApiUrl, orderData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Preia istoricul comenzilor pentru utilizatorul autentificat.
   * Backend-ul folosește token-ul JWT pentru a identifica utilizatorul.
   * @returns Un Observable care emite un array cu comenzile utilizatorului.
   */
  getMyOrderHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.ordersApiUrl}/my-history`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Preia detaliile unei comenzi specifice din istoricul utilizatorului.
   * (Opțional, dacă backend-ul oferă un astfel de endpoint specific pentru 'my-history/:id')
   * Momentan, backend-ul pare să aibă doar GET /api/orders/{id} (admin) și GET /api/orders/my-history (user)
   * @param orderId ID-ul comenzii.
   * @returns Un Observable care emite comanda găsită.
   */
  // getMyOrderById(orderId: number): Observable<Order> {
  //   return this.http.get<Order>(`${this.ordersApiUrl}/my-history/${orderId}`) // Verifică endpoint-ul în backend
  //     .pipe(catchError(this.handleError));
  // }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'A apărut o eroare la procesarea comenzii.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Eroare client: ${error.error.message}`;
    } else {
      errorMessage = `Cod eroare server: ${error.status}, mesaj: ${error.error?.message || error.message}`;
    }
    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
