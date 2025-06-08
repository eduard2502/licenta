// src/app/features/user-dashboard/user-order-history/user-order-history.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { HttpErrorResponse } from '@angular/common/http';


import { Order } from '../../../shared/models/order.model';
import { OrderItem } from '../../../shared/models/order-item.model'; // <<< CORECTAT
import { ClientOrderService } from '../services/client-order.service';

@Component({
  selector: 'app-user-order-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './user-order-history.component.html',
  styleUrls: ['./user-order-history.component.scss']
})
export class UserOrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error: string | null = null;
  panelOpenState: boolean[] = [];

  private clientOrderService = inject(ClientOrderService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    this.isLoading = true;
    this.error = null;
    this.clientOrderService.getMyOrderHistory().subscribe({
      next: (data: Order[]) => { // Tipare explicită
        this.orders = data.sort((a, b) => new Date(b.orderDate!).getTime() - new Date(a.orderDate!).getTime());
        this.panelOpenState = new Array(this.orders.length).fill(false);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => { // Tipare explicită
        this.error = 'Nu s-a putut încărca istoricul comenzilor.';
        const errMsg = err.error?.message || err.message || 'Eroare necunoscută.';
        console.error('Eroare la încărcarea istoricului comenzilor:', err);
        this.isLoading = false;
        this.snackBar.open(`${this.error} ${errMsg}`, 'Închide', { duration: 5000 });
      }
    });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  calculateItemSubtotal(item: OrderItem): number {
    return (item.priceAtPurchase || 0) * item.quantity;
  }

  togglePanel(index: number): void {
    this.panelOpenState[index] = !this.panelOpenState[index];
  }
}
