// frontend/src/app/features/shopping-cart/shopping-cart.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { Cart, CartItem } from '../../shared/models/cart.model';
import { CartService } from './cart.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  cart: Cart | null = null;
  isLoading = true;
  isUpdating = false;
  updatingItemId: number | null = null;

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.loadCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Eroare la încărcarea coșului', 'Închide', { duration: 3000 });
        console.error(err);
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    if (newQuantity > item.productStock) {
      this.snackBar.open(`Stoc disponibil: ${item.productStock} buc.`, 'OK', { duration: 3000 });
      return;
    }

    this.isUpdating = true;
    this.updatingItemId = item.productId;
    
    this.cartService.updateCartItem(item.productId, { quantity: newQuantity }).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isUpdating = false;
        this.updatingItemId = null;
      },
      error: (err) => {
        this.isUpdating = false;
        this.updatingItemId = null;
        this.snackBar.open('Eroare la actualizarea cantității', 'Închide', { duration: 3000 });
        console.error(err);
      }
    });
  }

  removeItem(productId: number): void {
    this.isUpdating = true;
    this.cartService.removeFromCart(productId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.isUpdating = false;
        this.snackBar.open('Produs eliminat din coș', 'OK', { duration: 2000 });
      },
      error: (err) => {
        this.isUpdating = false;
        this.snackBar.open('Eroare la eliminarea produsului', 'Închide', { duration: 3000 });
        console.error(err);
      }
    });
  }

  clearCart(): void {
    if (confirm('Sigur doriți să goliți coșul?')) {
      this.isUpdating = true;
      this.cartService.clearCart().subscribe({
        next: () => {
          this.cart = null;
          this.isUpdating = false;
          this.snackBar.open('Coșul a fost golit', 'OK', { duration: 2000 });
        },
        error: (err) => {
          this.isUpdating = false;
          this.snackBar.open('Eroare la golirea coșului', 'Închide', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  proceedToCheckout(): void {
    if (this.cart && this.cart.items.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/products-list']);
  }
}