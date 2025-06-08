// src/app/features/products/product-detail/product-detail.component.ts
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

// Pipe custom pentru nl2br
@Pipe({
  name: 'nl2br',
  standalone: true
})
export class Nl2brPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    // Înlocuiește \n cu <br> și sanitizează HTML-ul
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
    Nl2brPipe // Importă pipe-ul custom
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

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.productId = +idFromRoute;
      if (!isNaN(this.productId) && this.productId > 0) {
        this.loadProductDetails();
        this.isAdminView = this.router.url.includes('/admin/products/edit/') || this.router.url.endsWith(`/admin/products/${this.productId}`); // Detectează ruta de admin specifică
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
        if (this.isAdminView) {
          this.router.navigate(['/admin/products']);
        } else {
           this.router.navigate(['/products']); // Redirecționează la lista publică de produse
        }
      }
    });
  }
  
  deleteProduct(): void {
    if (!this.product || !this.product.id) return;
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

  // Adaugă o metodă pentru a obține numele definiției specificației dacă nu este direct în `product.specifications`
  // Acest lucru ar necesita ca `ProductDto` din backend să includă și numele definiției, nu doar `definitionId`.
  // Modelul actual `SpecificationValue` are `name` și `unit` opționale, care ar trebui populate în `ProductFormComponent`
  // la selectarea unei `SpecificationDefinition` sau la încărcarea produsului.
  // Backend-ul ar trebui să returneze aceste detalii în `ProductDto.specifications`.

  // Dacă `product.specifications` conține deja `name` și `unit` pentru fiecare specificație (ceea ce ar fi ideal),
  // atunci template-ul HTML este corect.
}
