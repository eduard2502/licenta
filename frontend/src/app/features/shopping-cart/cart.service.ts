// frontend/src/app/features/shopping-cart/cart.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CheckoutRequest } from '../../shared/models/cart.model';
import { Order } from '../../shared/models/order.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = '/api/cart';
  private paypalApiUrl = '/api/paypal';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  private http = inject(HttpClient);

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  addToCart(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, request).pipe(
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  updateCartItem(productId: number, request: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${productId}`, request).pipe(
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  removeFromCart(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${productId}`).pipe(
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => this.cartSubject.next(null)),
      catchError(this.handleError)
    );
  }

  checkout(request: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/checkout`, request).pipe(
      tap(() => this.cartSubject.next(null)), // Clear local cart after checkout
      catchError(this.handleError)
    );
  }

  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart ? cart.totalItems : 0)
    );
  }

  getCartTotal(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart ? cart.totalAmount : 0)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'A apărut o eroare la procesarea coșului.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Eroare: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Cod eroare: ${error.status}`;
    }
    console.error('Cart service error:', error);
    return throwError(() => new Error(errorMessage));
  }
  createPayPalOrder(amount: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/paypal/create-order`, {
    amount: amount,
    currency: 'EUR' // Change to RON if needed
  }).pipe(catchError(this.handleError));
}

capturePayPalOrder(orderId: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/paypal/capture-order/${orderId}`, {})
    .pipe(catchError(this.handleError));
}
}