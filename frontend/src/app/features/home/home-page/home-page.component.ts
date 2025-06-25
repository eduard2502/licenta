import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../../products/product.service';

interface GroupedProducts {
  [category: string]: Product[];
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  products: Product[] = [];
  groupedProducts: GroupedProducts = {};
  productCategories: string[] = [];
  isLoading = true;
  error: string | null = null;

  private productService = inject(ProductService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.groupProductsByCategory();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Nu s-au putut încărca produsele.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // Navigate to all products
  viewAllProducts(): void {
    this.router.navigate(['/products-list']);
  }

 private groupProductsByCategory(): void {
  // Group products by categoryName
  this.groupedProducts = this.products.reduce((groups: GroupedProducts, product: Product) => {
    const category = product.categoryName || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {});

  // Get unique categories and sort them
  this.productCategories = Object.keys(this.groupedProducts).sort();
  
  // Updated category order for PC components
  const categoryOrder = [
    'Componente PC',
    'Laptopuri', 
    'Periferice',
    'Gaming',
    'Accesorii'
  ];
  
  this.productCategories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
}
}