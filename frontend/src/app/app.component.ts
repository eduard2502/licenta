// frontend/src/app/app.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InactivityService } from './auth/inactivity.service';
import { AuthService } from './auth/auth.service';
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
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Magazin Calculatoare';
  isLoggedIn = false;
  username: string | null = null;
  userRole: string | null = null;

  private authSubscription!: Subscription;
  private routerSubscription!: Subscription;

  public authService = inject(AuthService);
  private router = inject(Router);
  private inactivityService = inject(InactivityService);
  private snackBar = inject(MatSnackBar);

  hideToolbar = false;

  ngOnInit(): void {
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user ? user.username : null;
      this.userRole = this.authService.role;
      
      if (this.isLoggedIn) {
        this.inactivityService.startWatching();
      } else {
        this.inactivityService.stopWatching();
      }
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
  }

  navigateToProducts(): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Trebuie să fii autentificat pentru a vedea produsele.', 'Login', {
        duration: 5000,
      }).onAction().subscribe(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/products-list' } });
      });
    } else {
      this.router.navigate(['/products-list']);
    }
  }

  private clearNonPersistentAuth(): void {
    if (!this.authService.isLoggedIn()) {
      this.authService.logout();
    }
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
    this.inactivityService.stopWatching();
  }
}