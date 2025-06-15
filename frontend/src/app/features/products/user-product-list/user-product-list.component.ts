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
import { MatSelectModule } from '@angular/material/select'; // Add this import
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { Product } from '../../../shared/models/product.model';
import { Category } from '../../../shared/models/category.model'; // Add this import
import { ProductService } from '../product.service';
import { CartService } from '../../shopping-cart/cart.service';
import { CategoryAdminService } from '../../admin/services/category.admin.service'; // Add this import
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
    MatSelectModule, // Add this import
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
  categories: Category[] = []; // Add categories array
  selectedCategoryId: number | null = null; // Add selected category tracking
  searchText: string = ''; // Add search text tracking
  isLoading = true;
  error: string | null = null;
  isAddingToCart: { [key: number]: boolean } = {};
  
  // Pagination
  pageSize = 12;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private categoryService = inject(CategoryAdminService); // Inject category service
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadCategories(); // Load categories first
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        // Don't show error to user as categories are optional for filtering
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters(); // Apply filters after loading
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
    this.searchText = filterValue;
    this.applyFilters();
  }

  applyCategoryFilter(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.products;

    // Apply text filter
    if (this.searchText) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(this.searchText) ||
        product.categoryName?.toLowerCase().includes(this.searchText) ||
        product.description?.toLowerCase().includes(this.searchText)
      );
    }

    // Apply category filter
    if (this.selectedCategoryId !== null) {
      filtered = filtered.filter(product => 
        product.categoryId === this.selectedCategoryId
      );
    }

    this.filteredProducts = filtered;

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