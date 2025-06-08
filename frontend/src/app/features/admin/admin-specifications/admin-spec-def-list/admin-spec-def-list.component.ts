// src/app/features/admin/admin-specifications/admin-spec-def-list/admin-spec-def-list.component.ts
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
import { MatDialog } from '@angular/material/dialog'; // Pentru confirmare ștergere

import { SpecificationDefinition } from '../../../../shared/models/specification-definition.model';
import { SpecificationAdminService } from '../../services/specification-admin.service';
// import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component'; // Dialog de confirmare

@Component({
  selector: 'app-admin-spec-def-list',
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
    MatSnackBarModule
  ],
  templateUrl: './admin-spec-def-list.component.html',
  styleUrls: ['./admin-spec-def-list.component.scss']
})
export class AdminSpecDefListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'unit', 'actions'];
  dataSource: MatTableDataSource<SpecificationDefinition> = new MatTableDataSource();
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private specAdminService = inject(SpecificationAdminService);
  private snackBar = inject(MatSnackBar);
  // private dialog = inject(MatDialog); // Decomentează dacă folosești MatDialog

  ngOnInit(): void {
    this.loadSpecDefinitions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSpecDefinitions(): void {
    this.isLoading = true;
    this.error = null;
    this.specAdminService.getAllDefinitions().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Nu s-au putut încărca definițiile specificațiilor.';
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

  deleteSpecDefinition(specDefId: number): void {
    // TODO: Implementează un dialog de confirmare (MatDialog)
    const confirmation = window.confirm('Sunteți sigur că doriți să ștergeți această definiție de specificație? Aceasta ar putea afecta produsele existente.');
    if (confirmation) {
      this.specAdminService.deleteDefinition(specDefId).subscribe({
        next: () => {
          this.snackBar.open('Definiție specificație ștearsă cu succes!', 'OK', { duration: 3000 });
          this.loadSpecDefinitions(); // Reîncarcă lista
        },
        error: (err) => {
          const errMsg = err.error?.message || err.message || 'Eroare la ștergerea definiției specificației.';
          this.snackBar.open(errMsg, 'Închide', { duration: 5000 });
          console.error(err);
        }
      });
    }
  }
}
