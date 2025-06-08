// src/app/features/user-dashboard/user-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // CurrencyPipe pentru preț
import { Router, RouterModule, RouterOutlet } from '@angular/router'; // Router pentru a verifica URL-ul curent
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card'; // Pentru produsele recomandate
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../auth/auth.service';
import { Product } from '../../shared/models/product.model'; // Modelul de produs
import { ProductService } from '../products/product.service'; // Serviciul de produse

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    CurrencyPipe
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  public authService = inject(AuthService); // Public pentru a fi accesibil în template
  public router = inject(Router); // Public pentru a verifica URL-ul
  private productService = inject(ProductService);

  recommendedProducts: Product[] = [];
  isLoadingRecommendations = false;

  ngOnInit(): void {
    this.loadRecommendedProducts();
  }

  loadRecommendedProducts(): void {
    this.isLoadingRecommendations = true;
    // Exemplu: preia primele câteva produse sau o listă specială de recomandări
    this.productService.getAll().subscribe({ // S-ar putea să vrei un endpoint dedicat pentru recomandări
      next: (products) => {
        this.recommendedProducts = products.slice(0, 4); // Afișează primele 4 ca exemplu
        this.isLoadingRecommendations = false;
      },
      error: (err) => {
        console.error('Eroare la încărcarea produselor recomandate:', err);
        this.isLoadingRecommendations = false;
      }
    });
  }
}
