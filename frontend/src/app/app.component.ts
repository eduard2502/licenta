// src/app/app.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider'; // <<< CORECTAT: Import MatDividerModule

import { AuthService } from './auth/auth.service';
// import { ShoppingCartService } from './features/shopping-cart/shopping-cart.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule // <<< CORECTAT: Adaugă MatDividerModule aici
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Magazin Calculatoare';
  isLoggedIn = false;
  username: string | null = null;
  userRole: string | null = null;
  // cartItemCount = 0;

  private authSubscription!: Subscription;
  private routerSubscription!: Subscription;
  // private cartSubscription!: Subscription;

  public authService = inject(AuthService);
  private router = inject(Router);
  // private shoppingCartService = inject(ShoppingCartService);

  hideToolbar = false;

  ngOnInit(): void {
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user ? user.username : null;
      this.userRole = this.authService.role;
    });

    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
        const currentUser = this.authService.getCurrentUser();
        this.username = currentUser ? currentUser.username : null;
        this.userRole = this.authService.role;
    }

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.hideToolbar = event.urlAfterRedirects === '/login' || event.urlAfterRedirects.startsWith('/signup');
      }
    });

    // this.cartSubscription = this.shoppingCartService.getCartItemCount().subscribe(count => {
    //   this.cartItemCount = count;
    // });
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    // if (this.cartSubscription) {
    //   this.cartSubscription.unsubscribe();
    // }
  }
}
