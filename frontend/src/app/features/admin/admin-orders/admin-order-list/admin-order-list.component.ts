// src/app/features/admin/admin-orders/admin-order-list/admin-order-list.component.ts
import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms'; // Pentru ngModel

import { Order } from '../../../../shared/models/order.model';
import { OrderAdminService } from '../../services/order.admin.service';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule, // Adăugat FormsModule pentru ngModel
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DatePipe
  ],
  templateUrl: './admin-order-list.component.html',
  styleUrls: ['./admin-order-list.component.scss']
})
export class AdminOrderListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'customerName', 'orderDate', 'totalAmount', 'status', 'actions'];
  dataSource: MatTableDataSource<Order> = new MatTableDataSource();
  isLoading = true;
  error: string | null = null;

  statusFilter: string = ''; // Inițializat cu string gol sau 'ALL'
  // Lista completă de statusuri, inclusiv 'ALL' pentru a reseta filtrul
  readonly availableStatuses: string[] = ['PENDING_CONFIRMATION', 'APPROVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'ALL'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private orderService = inject(OrderAdminService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Custom sort pentru data și status (dacă este necesar pentru stringuri complexe)
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'orderDate': return new Date(item.orderDate || 0).getTime();
        case 'status': return this.formatStatus(item.status); // Sortează după statusul formatat
        default: return (item as any)[property];
      }
    };
  }

  /**
   * Getter pentru lista de statusuri care vor fi afișate în dropdown-ul de filtrare.
   * Exclude opțiunea 'ALL' din iterația directă, deoarece este gestionată separat.
   */
  get statusesForFilterDropdown(): string[] {
    return this.availableStatuses.filter(s => s !== 'ALL');
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    // Dacă statusFilter este 'ALL', trimitem undefined sau string gol la serviciu
    // pentru a prelua toate comenzile, în funcție de cum este implementat backend-ul/serviciul.
    const filterToSend = (this.statusFilter === 'ALL' || this.statusFilter === '') ? undefined : this.statusFilter;

    this.orderService.getAllOrders(filterToSend).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        // Paginatorul și sortarea sunt deja setate în ngAfterViewInit
        // this.dataSource.paginator = this.paginator; // Nu este nevoie aici dacă e în ngAfterViewInit
        // this.dataSource.sort = this.sort;         // Nu este nevoie aici
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Nu s-au putut încărca comenzile.';
        const errMsg = err.error?.message || err.message || 'Eroare necunoscută.';
        console.error('Eroare la încărcarea comenzilor:', err);
        this.isLoading = false;
        this.snackBar.open(`${this.error} ${errMsg}`, 'Închide', { duration: 5000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onStatusFilterChange(): void {
    this.loadOrders();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); // Resetează paginatorul la schimbarea filtrului
    }
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
}
