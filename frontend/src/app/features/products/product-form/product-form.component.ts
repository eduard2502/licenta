// src/app/features/products/product-form/product-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HttpErrorResponse } from '@angular/common/http';

import { Product, SpecificationValue } from '../../../shared/models/product.model';
import { Category } from '../../../shared/models/category.model';
import { SpecificationDefinition } from '../../../shared/models/specification-definition.model';

import { ProductService } from '../product.service';
import { CategoryAdminService } from '../../admin/services/category.admin.service';
import { SpecificationAdminService } from '../../admin/services/specification-admin.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatCardModule, MatSelectModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatIconModule, MatDividerModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId?: number;
  isLoading = false;
  pageTitle = 'Adaugă Produs Nou';
  submitButtonText = 'Salvează Produs';
  error: string | null = null;

  categories$: Observable<Category[]> = of([]);
  specDefinitions$: Observable<SpecificationDefinition[]> = of([]);
  
  // imagePreview: string | ArrayBuffer | null = null; // COMENTAT TEMPORAR

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryAdminService = inject(CategoryAdminService);
  private specAdminService = inject(SpecificationAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(5000)]],
      price: [null, [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      stockQuantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
      // imageBase64: [null], // COMENTAT TEMPORAR
      categoryId: [null, Validators.required],
      specifications: this.fb.array([])
    });

    this.loadDropdownData();

    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      this.productId = +idFromRoute;
      if (!isNaN(this.productId) && this.productId > 0) {
        this.isEditMode = true;
        this.pageTitle = 'Editează Produs';
        this.submitButtonText = 'Actualizează Produs';
        this.loadProductData(this.productId);
      } else {
        this.handleInvalidId('ID produs invalid din rută.');
      }
    }
  }

  loadDropdownData(): void {
    this.categories$ = this.categoryAdminService.getAll().pipe(
      catchError(err => {
        this.snackBar.open('Eroare la încărcarea categoriilor.', 'OK', { duration: 3000 });
        console.error(err);
        return of([]);
      })
    );
    this.specDefinitions$ = this.specAdminService.getAllDefinitions().pipe(
      catchError(err => {
        this.snackBar.open('Eroare la încărcarea definițiilor de specificații.', 'OK', { duration: 3000 });
        console.error(err);
        return of([]);
      })
    );
  }

  loadProductData(id: number): void {
    this.isLoading = true;
    this.productService.getById(id).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          categoryId: product.categoryId,
        });
        // if (product.imageBase64) { // COMENTAT TEMPORAR
        //   this.imagePreview = product.imageBase64; 
        //   this.productForm.get('imageBase64')?.setValue(product.imageBase64, { emitEvent: false });
        // } // COMENTAT TEMPORAR
        this.specificationsFormArray.clear();
        product.specifications?.forEach(spec => this.addSpecification(spec));
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => this.handleLoadError('Eroare la încărcarea datelor produsului.', err)
    });
  }

  get specificationsFormArray(): FormArray {
    return this.productForm.get('specifications') as FormArray;
  }

  createSpecificationGroup(spec?: SpecificationValue): FormGroup {
    return this.fb.group({
      definitionId: [spec?.definitionId || null, Validators.required],
      value: [spec?.value || '', Validators.required],
    });
  }

  addSpecification(spec?: SpecificationValue): void {
    this.specificationsFormArray.push(this.createSpecificationGroup(spec));
  }

  removeSpecification(index: number): void {
    this.specificationsFormArray.removeAt(index);
  }

  /* // COMENTAT TEMPORAR - Funcționalitatea pentru imagini
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.productForm.patchValue({ imageBase64: reader.result as string });
        this.productForm.get('imageBase64')?.markAsDirty(); 
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(): void {
    this.imagePreview = null;
    this.productForm.patchValue({ imageBase64: null });
    this.productForm.get('imageBase64')?.markAsDirty();
    const fileInput = document.getElementById('productImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  */

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Formular invalid. Verificați câmpurile.', 'OK', { duration: 3000 });
      this.productForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const formValue = this.productForm.getRawValue();
    const productData: Product = {
        ...formValue,
        // imageBase64: formValue.imageBase64, // COMENTAT TEMPORAR
        specifications: formValue.specifications.map((spec: any) => ({
            definitionId: spec.definitionId,
            value: spec.value
        }))
    };
    // if (productData.imageBase64 === '') { // COMENTAT TEMPORAR
    //     productData.imageBase64 = null;    // COMENTAT TEMPORAR
    // } // COMENTAT TEMPORAR


    const operation = this.isEditMode && this.productId
      ? this.productService.update(this.productId, productData)
      : this.productService.create(productData);

    operation.subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open(`Produs ${this.isEditMode ? 'actualizat' : 'creat'} cu succes!`, 'OK', { duration: 3000 });
        this.router.navigate(['/admin/products']);
      },
      error: (err: HttpErrorResponse) => this.handleSubmitError(`Eroare la ${this.isEditMode ? 'actualizarea' : 'crearea'} produsului.`, err)
    });
  }
  
  private handleInvalidId(message: string): void {
    this.isLoading = false;
    this.error = message;
    this.snackBar.open(this.error, 'Închide', { duration: 3000 });
    this.router.navigate(['/admin/products']);
  }

  private handleLoadError(message: string, err: HttpErrorResponse): void {
    this.isLoading = false;
    const serverErrorMessage = err.error?.message || err.message || 'Eroare necunoscută.';
    this.error = `${message} ${serverErrorMessage}`;
    this.snackBar.open(this.error, 'Închide', { duration: 5000 });
    console.error(err);
    this.router.navigate(['/admin/products']);
  }

  private handleSubmitError(message: string, err: HttpErrorResponse): void {
    this.isLoading = false;
    const serverErrorMessage = err.error?.message || err.message || 'Eroare necunoscută.';
    this.snackBar.open(`${message} ${serverErrorMessage}`, 'Închide', { duration: 5000 });
    console.error(err);
  }

  get f() { return this.productForm.controls; }
}