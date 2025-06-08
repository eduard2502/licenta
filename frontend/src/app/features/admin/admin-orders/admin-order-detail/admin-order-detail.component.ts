// src/app/features/admin/admin-orders/admin-order-detail/admin-order-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { HttpErrorResponse } from '@angular/common/http';


import { Order } from '../../../../shared/models/order.model';
import { OrderItem } from '../../../../shared/models/order-item.model'; // <<< CORECTAT
import { OrderStatusUpdate } from '../../../../shared/models/order-status-update.model'; // <<< CORECTAT
import { OrderAdminService } from '../../services/order.admin.service';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss']
})
export class AdminOrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  orderId!: number;

  statusUpdateForm!: FormGroup;
  availableStatuses: string[] = ['PENDING_CONFIRMATION', 'APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'];
  isUpdatingStatus = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderAdminService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.orderId = +idFromRoute;
      if (!isNaN(this.orderId) && this.orderId > 0) {
        this.loadOrderDetails();
        this.statusUpdateForm = this.fb.group({
          newStatus: ['', Validators.required]
        });
      } else {
        this.handleInvalidId();
      }
    } else {
      this.handleInvalidId();
    }
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.error = 'ID comandă invalid.';
    this.snackBar.open(this.error, 'Închide', { duration: 3000 });
    this.router.navigate(['/admin/orders']);
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.error = null;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (data: Order) => { // Tipare explicită
        this.order = data;
        this.statusUpdateForm.patchValue({ newStatus: this.order.status });
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => { // Tipare explicită
        this.error = 'Nu s-au putut încărca detaliile comenzii.';
        const errMsg = err.error?.message || err.message || 'Eroare necunoscută.';
        console.error('Eroare la încărcarea detaliilor comenzii:', err);
        this.isLoading = false;
        this.snackBar.open(`${this.error} ${errMsg}`, 'Închide', { duration: 5000 });
      }
    });
  }

  onUpdateStatus(): void {
    if (this.statusUpdateForm.invalid || !this.order) {
      this.snackBar.open('Vă rugăm selectați un status valid.', 'OK', { duration: 3000 });
      return;
    }

    this.isUpdatingStatus = true;
    const statusUpdate: OrderStatusUpdate = this.statusUpdateForm.value;

    this.orderService.updateOrderStatus(this.orderId, statusUpdate).subscribe({
      next: (updatedOrder: Order) => { // Tipare explicită
        this.order = updatedOrder;
        this.statusUpdateForm.patchValue({ newStatus: updatedOrder.status });
        this.isUpdatingStatus = false;
        this.snackBar.open('Statusul comenzii a fost actualizat cu succes!', 'OK', { duration: 3000 });
      },
      error: (err: HttpErrorResponse) => { // Tipare explicită
        this.isUpdatingStatus = false;
        const errorMessage = err.error?.message || err.message || 'Eroare la actualizarea statusului comenzii.';
        this.snackBar.open(errorMessage, 'Închide', { duration: 5000 });
        console.error(err);
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
}
