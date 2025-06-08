// src/app/features/admin/admin-categories/admin-category-list/admin-category-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// Importă un dialog de confirmare generic dacă ai unul, sau creează unul simplu.
// import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';


import { Category } from '../../../../shared/models/category.model';
import { CategoryAdminService } from '../../services/category.admin.service'; // Asigură-te că numele serviciului este corect

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './admin-category-list.component.html',
  styleUrls: ['./admin-category-list.component.scss']
})
export class AdminCategoryListComponent implements OnInit {
  categories: Category[] = [];
  isLoading = true;
  error: string | null = null;

  private categoryService = inject(CategoryAdminService);
  private snackBar = inject(MatSnackBar);
  // private dialog = inject(MatDialog); // Decomentează dacă folosești MatDialog

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Încarcă lista de categorii de la server.
   */
  loadCategories(): void {
    this.isLoading = true;
    this.error = null;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Nu s-au putut încărca categoriile.';
        const errMsg = err.error?.message || err.message || 'Eroare necunoscută.';
        console.error('Eroare la încărcarea categoriilor:', err);
        this.isLoading = false;
        this.snackBar.open(`${this.error} ${errMsg}`, 'Închide', { duration: 5000 });
      }
    });
  }

  /**
   * Șterge o categorie după o confirmare.
   * @param categoryId ID-ul categoriei de șters.
   */
  deleteCategory(categoryId: number): void {
    // TODO: Implementează un dialog de confirmare (MatDialog) înainte de ștergere.
    // Exemplu simplu cu window.confirm, dar MatDialog e preferat:
    const confirmation = window.confirm('Sunteți sigur că doriți să ștergeți această categorie? Această acțiune nu poate fi anulată.');
    if (confirmation) {
      this.isLoading = true; // Indică începerea operației
      this.categoryService.delete(categoryId).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Categorie ștearsă cu succes!', 'OK', { duration: 3000 });
          this.loadCategories(); // Reîncarcă lista pentru a reflecta ștergerea
        },
        error: (err) => {
          this.isLoading = false;
          const errMsg = err.error?.message || err.message || 'Eroare la ștergerea categoriei.';
          this.snackBar.open(errMsg, 'Închide', { duration: 5000 });
          console.error('Eroare la ștergerea categoriei:', err);
        }
      });
    }
  }
}
