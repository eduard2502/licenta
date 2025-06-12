// src/app/features/admin/admin-users/admin-user-form/admin-user-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'; // Import FormControl
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpErrorResponse } from '@angular/common/http';


import { User, UserUpdateDto } from '../../../../shared/models/user.model';
import { UserAdminService } from '../../services/user-admin.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './admin-user-form.component.html',
  styleUrls: ['./admin-user-form.component.scss']
})
export class AdminUserFormComponent implements OnInit {
  userForm!: FormGroup;
  userId!: number;
  isLoading = false;
  pageTitle = 'Editează Utilizator';
  submitButtonText = 'Actualizează Utilizator';
  userToEdit: User | null = null;
  error: string | null = null; // Adăugat pentru a stoca mesajul de eroare

  availableRoles: string[] = ['ROLE_USER', 'ROLE_ADMIN'];
  currentUserId: number | null = null;

  private fb = inject(FormBuilder);
  private userAdminService = inject(UserAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      // Folosim un FormControl care va ține un array de string-uri pentru MatSelect multiple
      selectedRoles: new FormControl([] as string[], Validators.required) // <<< CORECTAT
    });

    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.userId = +idFromRoute;
      if (!isNaN(this.userId) && this.userId > 0) {
        this.loadUserData(this.userId);
      } else {
        this.handleInvalidId('ID utilizator invalid din rută.');
      }
    } else {
      this.handleInvalidId('ID utilizator lipsă din rută.');
    }

    const currentUser = this.authService.getCurrentUser();
     if (currentUser && currentUser.id) {
        this.currentUserId = currentUser.id;
    }
  }

  loadUserData(id: number): void {
    this.isLoading = true;
    this.userAdminService.getUserById(id).subscribe({
      next: (user: User) => { // Tipare explicită
        this.userToEdit = user;
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          // Setează valoarea pentru FormControl-ul de roluri
          selectedRoles: user.roles || [] // <<< CORECTAT
        });
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => this.handleLoadError('Eroare la încărcarea datelor utilizatorului.', err) // Tipare explicită
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.snackBar.open('Formular invalid. Verificați câmpurile.', 'OK', { duration: 3000 });
      this.userForm.markAllAsTouched();
      return;
    }

    const selectedRolesValue = this.userForm.get('selectedRoles')?.value as string[];

    if (this.userId === this.currentUserId) {
        if (!selectedRolesValue.includes('ROLE_ADMIN')) {
            this.snackBar.open('Nu vă puteți elimina propriul rol de Administrator.', 'OK', {duration: 5000});
            return;
        }
    }

    this.isLoading = true;
    const userData: UserUpdateDto = {
      email: this.userForm.get('email')?.value,
      roles: selectedRolesValue
    };

    // Log the data being sent
    console.log('Sending update data:', JSON.stringify(userData));
    console.log('User ID:', this.userId);

    this.userAdminService.updateUser(this.userId, userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Utilizator actualizat cu succes!', 'OK', { duration: 3000 });
        this.router.navigate(['/admin/users']);
      },
      error: (err: HttpErrorResponse) => this.handleSubmitError('Eroare la actualizarea utilizatorului.', err)
    });
  }
  
  private handleInvalidId(message: string): void {
    this.isLoading = false;
    this.error = message;
    this.snackBar.open(this.error, 'Închide', { duration: 3000 });
    this.router.navigate(['/admin/users']);
  }

  private handleLoadError(message: string, err: HttpErrorResponse): void {
    this.isLoading = false;
    const serverErrorMessage = err.error?.message || err.message || 'Eroare necunoscută.';
    this.error = `${message} ${serverErrorMessage}`;
    this.snackBar.open(this.error, 'Închide', { duration: 5000 });
    console.error(err);
    this.router.navigate(['/admin/users']);
  }

  private handleSubmitError(message: string, err: HttpErrorResponse): void {
    this.isLoading = false;
    const serverErrorMessage = err.error?.message || err.message || 'Eroare necunoscută.';
    this.snackBar.open(`${message} ${serverErrorMessage}`, 'Închide', { duration: 5000 });
    console.error(err);
  }

  get f() { return this.userForm.controls; }
}
