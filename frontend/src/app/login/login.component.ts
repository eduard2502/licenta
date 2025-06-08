// src/app/login/login.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // ActivatedRoute pentru returnUrl
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


import { AuthService } from '../auth/auth.service'; // Serviciul de autentificare

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Pentru link-ul de înregistrare
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  private returnUrl: string = '/'; // Default redirect URL

  private fb = inject(FormBuilder);
  public authService = inject(AuthService); // Public pentru a fi accesibil în template (ex: pentru link signup)
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Pentru a prelua returnUrl
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Preia URL-ul de redirectare din query params, dacă există
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Dacă utilizatorul este deja logat, redirecționează-l
    if (this.authService.isLoggedIn()) {
        const userRole = this.authService.role;
        if (userRole === 'admin') {
            this.router.navigate(['/admin']);
        } else if (userRole === 'user') {
            this.router.navigate(['/user']);
        } else {
            this.router.navigate([this.returnUrl]); // Sau o pagină default
        }
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Nume de utilizator sau parolă invalidă.', 'OK', { duration: 3000 });
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.snackBar.open('Autentificare reușită!', 'OK', { duration: 2000 });
          const userRole = this.authService.role; // Preia rolul după login reușit
          
          // Redirecționează în funcție de rol sau la returnUrl
          if (this.returnUrl && this.returnUrl !== '/') {
            this.router.navigateByUrl(this.returnUrl);
          } else if (userRole === 'admin') {
            this.router.navigate(['/admin']);
          } else if (userRole === 'user') {
            this.router.navigate(['/user']);
          } else {
            this.router.navigate(['/']); // Fallback la pagina principală
          }
        } else {
          // AuthService gestionează deja afișarea erorii prin snackbar în cazul în care login-ul eșuează
          // dar putem adăuga un mesaj generic aici dacă metoda login returnează doar boolean
          // this.snackBar.open('Autentificare eșuată. Verificați credențialele.', 'Închide', { duration: 3000 });
        }
      },
      error: (err) => {
        // AuthService ar trebui să gestioneze eroarea și să afișeze un snackbar
        // Dacă nu, o facem aici.
        this.isLoading = false;
        const errorMessage = err.error?.message || err.message || 'Autentificare eșuată. Vă rugăm încercați din nou.';
        this.snackBar.open(errorMessage, 'Închide', { duration: 5000 });
        console.error('Login error:', err);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  get f() { return this.loginForm.controls; }
}
