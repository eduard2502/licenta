// src/app/features/admin/admin-users/admin-user-list/admin-user-list.component.ts
import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips'; // Pentru afișarea rolurilor
import { MatDialog } from '@angular/material/dialog';
// import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

import { User } from '../../../../shared/models/user.model';
import { UserAdminService } from '../../services/user-admin.service';
import { AuthService } from '../../../../auth/auth.service'; // Pentru a nu permite ștergerea userului curent

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.scss']
})
export class AdminUserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'username', 'email', 'roles', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource();
  isLoading = true;
  error: string | null = null;
  currentUserId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private userAdminService = inject(UserAdminService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService); // Injectează AuthService
  // private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadUsers();
    // Obține ID-ul utilizatorului curent pentru a preveni auto-ștergerea
    const currentUser = this.authService.getCurrentUser(); // Presupunând că AuthService are această metodă
    if (currentUser && currentUser.id) {
        this.currentUserId = currentUser.id;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Custom sort pentru roluri (array de string-uri)
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'roles': return item.roles.join(', ');
        default: return (item as any)[property];
      }
    };
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    this.userAdminService.getAllUsers().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Nu s-au putut încărca utilizatorii.';
        console.error(err);
        this.isLoading = false;
        this.snackBar.open(this.error, 'Închide', { duration: 5000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteUser(userId: number, username: string): void {
    if (userId === this.currentUserId) {
      this.snackBar.open('Nu vă puteți șterge propriul cont de administrator.', 'OK', { duration: 5000 });
      return;
    }

    // TODO: Implementează un dialog de confirmare (MatDialog)
    const confirmation = window.confirm(`Sunteți sigur că doriți să ștergeți utilizatorul "${username}"?`);
    if (confirmation) {
      this.userAdminService.deleteUser(userId).subscribe({
        next: () => {
          this.snackBar.open(`Utilizatorul "${username}" a fost șters cu succes!`, 'OK', { duration: 3000 });
          this.loadUsers(); // Reîncarcă lista
        },
        error: (err) => {
          const errMsg = err.error?.message || err.message || `Eroare la ștergerea utilizatorului "${username}".`;
          this.snackBar.open(errMsg, 'Închide', { duration: 5000 });
          console.error(err);
        }
      });
    }
  }

  formatRoles(roles: string[]): string {
    return roles.map(role => role.replace('ROLE_', '')).join(', ');
  }
}
