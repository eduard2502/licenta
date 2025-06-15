// frontend/src/app/features/products/user-product-list/user-product-list.component.ts
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, SlicePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../product.service';
import { CartService } from '../../shopping-cart/cart.service';
import { AddToCartRequest } from '../../../shared/models/cart.model';

@Component({
  selector: 'app-user-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    CurrencyPipe,
    SlicePipe
  ],
  templateUrl: './user-product-list.component.html',
  styleUrls: ['./user-product-list.component.scss']
})
export class UserProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  error: string | null = null;
  isAddingToCart: { [key: number]: boolean } = {};
  
  // Pagination
  pageSize = 12;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Nu s-au putut încărca produsele.';
        console.error(err);
        this.isLoading = false;
        this.snackBar.open(this.error, 'Închide', { duration: 5000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    
    if (!filterValue) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(filterValue) ||
        product.categoryName?.toLowerCase().includes(filterValue) ||
        product.description?.toLowerCase().includes(filterValue)
      );
    }
    
    // Reset to first page when filtering
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  getPaginatedProducts(): Product[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  addToCart(product: Product): void {
    if (!product || typeof product.id === 'undefined') {
      this.snackBar.open('Detaliile produsului sunt incomplete.', 'Închide', { duration: 3000 });
      return;
    }

    this.isAddingToCart[product.id] = true;

    const request: AddToCartRequest = {
      productId: product.id,
      quantity: 1
    };

    this.cartService.addToCart(request).subscribe({
      next: () => {
        this.isAddingToCart[product.id!] = false;
        this.snackBar.open(`"${product.name}" a fost adăugat în coș!`, 'OK', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.isAddingToCart[product.id!] = false;
        const errorMessage = err.error?.message || 'A apărut o eroare la adăugarea produsului în coș.';
        this.snackBar.open(errorMessage, 'Închide', {
          duration: 5000
        });
        console.error('Error adding to cart:', err);
      }
    });
  }
}