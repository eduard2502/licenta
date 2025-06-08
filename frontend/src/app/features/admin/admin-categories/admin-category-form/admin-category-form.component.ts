// src/app/features/admin/admin-categories/admin-category-form/admin-category-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

import { Category } from '../../../../shared/models/category.model';
// Calea corectă și numele fișierului serviciului
import { CategoryAdminService } from '../../services/category.admin.service'; // <<<--- CALE ȘI NUME FIȘIER CORECTATE

@Component({
  selector: 'app-admin-category-form',
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
    MatIconModule
  ],
  templateUrl: './admin-category-form.component.html',
  styleUrls: ['./admin-category-form.component.scss']
})
export class AdminCategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode = false;
  categoryId?: number;
  isLoading = false;
  pageTitle = 'Adaugă Categorie Nouă';
  submitButtonText = 'Salvează';
  error: string | null = null; // Adăugat pentru a stoca mesajul de eroare

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]]
    });

    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.categoryId = +idFromRoute;
      if (!isNaN(this.categoryId) && this.categoryId > 0) {
        this.isEditMode = true;
        this.pageTitle = 'Editează Categorie';
        this.submitButtonText = 'Actualizează';
        this.loadCategoryData(this.categoryId);
      } else {
        this.handleInvalidId('ID categorie invalid din rută.');
      }
    }
  }

  loadCategoryData(id: number): void {
    this.isLoading = true;
    this.categoryService.getById(id).subscribe({
      next: (category: Category) => { // <<<--- TIPARE EXPLICITĂ PENTRU 'category'
        this.categoryForm.patchValue(category);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => this.handleLoadError('Eroare la încărcarea datelor categoriei.', err) // <<<--- TIPARE EXPLICITĂ ȘI REFACUT
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.snackBar.open('Formular invalid. Vă rugăm corectați erorile.', 'OK', { duration: 3000 });
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const categoryData: Category = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      this.categoryService.update(this.categoryId, categoryData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Categorie actualizată cu succes!', 'OK', { duration: 3000 });
          this.router.navigate(['/admin/categories']);
        },
        error: (err: HttpErrorResponse) => this.handleSubmitError('Eroare la actualizarea categoriei.', err) // <<<--- TIPARE EXPLICITĂ ȘI REFACUT
      });
    } else {
      this.categoryService.create(categoryData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Categorie creată cu succes!', 'OK', { duration: 3000 });
          this.router.navigate(['/admin/categories']);
        },
        error: (err: HttpErrorResponse) => this.handleSubmitError('Eroare la crearea categoriei.', err) // <<<--- TIPARE EXPLICITĂ ȘI REFACUT
      });
    }
  }

  private handleInvalidId(message: string): void {
    this.isLoading = false;
    this.error = message; // Setează mesajul de eroare
    this.snackBar.open(this.error, 'Închide', { duration: 3000 });
    this.router.navigate(['/admin/categories']);
  }

  private handleLoadError(message: string, err: HttpErrorResponse): void {
    this.isLoading = false;
    // Extrage mesajul de eroare din răspunsul backend-ului dacă există
    const serverErrorMessage = err.error?.message || err.message || 'Eroare necunoscută de la server.';
    this.error = `${message} ${serverErrorMessage}`;
    this.snackBar.open(this.error, 'Închide', { duration: 5000 });
    console.error('Eroare la încărcare:', err);
    this.router.navigate(['/admin/categories']);
  }

  private handleSubmitError(message: string, err: HttpErrorResponse): void {
    this.isLoading = false;
    const serverErrorMessage = err.error?.message || err.message || 'Eroare necunoscută de la server.';
    this.snackBar.open(`${message} ${serverErrorMessage}`, 'Închide', { duration: 5000 });
    console.error('Eroare la submit:', err);
  }


  get f() { return this.categoryForm.controls; }
}
