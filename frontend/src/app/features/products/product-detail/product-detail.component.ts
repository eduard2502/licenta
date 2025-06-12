import { Component, OnInit, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../product.service';
import { AuthService } from '../../../auth/auth.service';
import { CartService } from '../../shopping-cart/cart.service';
import { AddToCartRequest } from '../../../shared/models/cart.model';

// Pipe custom pentru nl2br
@Pipe({
  name: 'nl2br',
  standalone: true
})
export class Nl2brPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustHtml(value.replace(/\n/g, '<br/>'));
  }
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    CurrencyPipe,
    TitleCasePipe,
    Nl2brPipe
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  error: string | null = null;
  productId!: number;
  isAdminView = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);
  private cartService = inject(CartService);

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.productId = +idFromRoute;
      if (!isNaN(this.productId) && this.productId > 0) {
        this.loadProductDetails();
        this.isAdminView = this.router.url.includes('/admin/');
      } else {
        this.handleInvalidId();
      }
    } else {
      this.handleInvalidId();
    }
  }

  private handleInvalidId(): void {
    this.isLoading = false;
    this.error = 'ID produs invalid.';
    this.snackBar.open(this.error, 'Închide', { duration: 3000 });
    this.router.navigate(['/']);
  }

  loadProductDetails(): void {
    this.isLoading = true;
    this.error = null;
    this.productService.getById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Nu s-au putut încărca detaliile produsului.';
        const errMsg = err.error?.message || err.message || 'Eroare necunoscută.';
        this.snackBar.open(`${this.error} ${errMsg}`, 'Închide', { duration: 5000 });
        console.error(err);
        this.router.navigate(['/']);
      }
    });
  }

  deleteProduct(): void {
    if (!this.product || typeof this.product.id === 'undefined') return;
    const confirmation = window.confirm('Sunteți sigur că doriți să ștergeți acest produs?');
    if (confirmation) {
      this.isLoading = true;
      this.productService.delete(this.product.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Produs șters cu succes!', 'OK', { duration: 3000 });
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Eroare la ștergerea produsului.', 'Închide', { duration: 5000 });
          console.error(err);
        }
      });
    }
  }

  addToCart(): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Trebuie să fii autentificat pentru a adăuga produse în coș.', 'Login', {
        duration: 5000,
      }).onAction().subscribe(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      });
      return;
    }

    // AICI ESTE CORECȚIA: Verificăm și dacă produsul are un ID.
    if (!this.product || typeof this.product.id === 'undefined') {
      this.snackBar.open('Detaliile produsului sunt incomplete. Vă rugăm reîncercați.', 'Închide', { duration: 3000 });
      return;
    }

    const request: AddToCartRequest = {
      productId: this.product.id, // Acum TypeScript știe sigur că `this.product.id` este un număr.
      quantity: 1
    };

    this.isLoading = true;
    this.cartService.addToCart(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(`"${this.product?.name}" a fost adăugat în coș!`, 'OK', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.message || 'A apărut o eroare la adăugarea produsului în coș.';
        this.snackBar.open(errorMessage, 'Închide', {
          duration: 5000
        });
        console.error('Error adding to cart:', err);
      }
    });
  }
}
