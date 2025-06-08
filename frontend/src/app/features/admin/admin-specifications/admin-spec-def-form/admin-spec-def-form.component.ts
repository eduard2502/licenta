// src/app/features/admin/admin-specifications/admin-spec-def-form/admin-spec-def-form.component.ts
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

import { SpecificationDefinition } from '../../../../shared/models/specification-definition.model';
import { SpecificationAdminService } from '../../services/specification-admin.service';

@Component({
  selector: 'app-admin-spec-def-form',
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
  templateUrl: './admin-spec-def-form.component.html',
  styleUrls: ['./admin-spec-def-form.component.scss']
})
export class AdminSpecDefFormComponent implements OnInit {
  specDefForm!: FormGroup;
  isEditMode = false;
  specDefId?: number;
  isLoading = false;
  pageTitle = 'Adaugă Definiție Specificație';
  submitButtonText = 'Salvează Definiție';

  private fb = inject(FormBuilder);
  private specAdminService = inject(SpecificationAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.specDefForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      unit: ['', [Validators.maxLength(50)]] // Unitatea este opțională
    });

    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.specDefId = +idFromRoute;
      if (!isNaN(this.specDefId) && this.specDefId > 0) {
        this.isEditMode = true;
        this.pageTitle = 'Editează Definiție Specificație';
        this.submitButtonText = 'Actualizează Definiție';
        this.loadSpecDefData(this.specDefId);
      } else {
        this.handleInvalidId('ID definiție specificație invalid din rută.');
      }
    }
  }

  loadSpecDefData(id: number): void {
    this.isLoading = true;
    this.specAdminService.getDefinitionById(id).subscribe({
      next: (specDef) => {
        this.specDefForm.patchValue(specDef);
        this.isLoading = false;
      },
      error: (err) => this.handleLoadError('Eroare la încărcarea datelor definiției.', err)
    });
  }

  onSubmit(): void {
    if (this.specDefForm.invalid) {
      this.snackBar.open('Formular invalid. Verificați câmpurile.', 'OK', { duration: 3000 });
      this.specDefForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const specDefData: SpecificationDefinition = this.specDefForm.value;

    const operation = this.isEditMode && this.specDefId
      ? this.specAdminService.updateDefinition(this.specDefId, { ...specDefData, id: this.specDefId })
      : this.specAdminService.createDefinition(specDefData as Omit<SpecificationDefinition, 'id'>);

    operation.subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(`Definiție specificație ${this.isEditMode ? 'actualizată' : 'creată'} cu succes!`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/specification-definitions']);
      },
      error: (err) => this.handleSubmitError(`Eroare la ${this.isEditMode ? 'actualizarea' : 'crearea'} definiției.`, err)
    });
  }
  
  private handleInvalidId(message: string): void {
    this.isLoading = false;
    this.snackBar.open(message, 'Închide', { duration: 3000 });
    this.router.navigate(['/admin/specification-definitions']);
  }

  private handleLoadError(message: string, err: any): void {
    this.isLoading = false;
    const errMsg = err.error?.message || err.message || 'Eroare necunoscută.';
    this.snackBar.open(`${message} ${errMsg}`, 'Închide', { duration: 5000 });
    console.error(err);
    this.router.navigate(['/admin/specification-definitions']);
  }

  private handleSubmitError(message: string, err: any): void {
    this.isLoading = false;
    const errMsg = err.error?.message || err.message || 'Eroare necunoscută.';
    this.snackBar.open(`${message} ${errMsg}`, 'Închide', { duration: 5000 });
    console.error(err);
  }

  get f() { return this.specDefForm.controls; }
}
