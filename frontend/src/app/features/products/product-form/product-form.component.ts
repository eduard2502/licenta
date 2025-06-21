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
import { Observable, of, forkJoin } from 'rxjs';
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
  isLoading = true;
  pageTitle = 'Adaugă Produs Nou';
  submitButtonText = 'Salvează Produs';
  error: string | null = null;

  // Vom popula aceste array-uri pentru o gestionare mai sigură
  categories: Category[] = [];
  specDefinitions: SpecificationDefinition[] = [];

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
      // AICI ESTE PRIMA MODIFICARE CHEIE: Am eliminat validatorul de pattern
      price: [null, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [0, [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]*$/)]],
      categoryId: [null, Validators.required],
      imageBase64: [null as string | null],
      specifications: this.fb.array([])
    });

    this.loadInitialData();
  }

  // A DOUA MODIFICARE CHEIE: Folosim forkJoin pentru a încărca totul sincronizat
  loadInitialData(): void {
    this.isLoading = true;
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idFromRoute;
    this.productId = idFromRoute ? +idFromRoute : undefined;

    // Definim sursele de date
    const categories$ = this.categoryAdminService.getAll();
    const specDefinitions$ = this.specAdminService.getAllDefinitions();
    const product$ = this.isEditMode && this.productId
      ? this.productService.getById(this.productId)
      : of(null);

    forkJoin({
      categories: categories$,
      specDefinitions: specDefinitions$,
      product: product$
    }).pipe(
      catchError(err => {
        this.handleLoadError('Eroare la încărcarea datelor necesare pentru formular.', err);
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.categories = result.categories;
        this.specDefinitions = result.specDefinitions;
        
        if (this.isEditMode) {
          this.pageTitle = 'Editează Produs';
          this.submitButtonText = 'Actualizează Produs';
          if (result.product) {
            this.populateForm(result.product);
          } else {
             this.handleInvalidId('Produsul nu a putut fi încărcat.');
          }
        }
      }
      this.isLoading = false;
    });
  }

  populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.categoryId,
      imageBase64: product.imageBase64 
    });
    
    this.specificationsFormArray.clear();
    product.specifications?.forEach(spec => this.addSpecification(spec));
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

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.productForm.patchValue({
          imageBase64: reader.result as string
        });
        this.productForm.markAsDirty(); // Mark form as dirty to enable save button
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.isEditMode && this.productForm.pristine) {
      this.snackBar.open('Nu ați făcut nicio modificare pentru a salva.', 'OK', { duration: 3000 });
      return;
    }
      
    if (this.productForm.invalid) {
      this.snackBar.open('Formular invalid. Verificați câmpurile marcate cu roșu.', 'OK', { duration: 4000 });
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.productForm.getRawValue();
    const productData: Omit<Product, 'id'> = {
        ...formValue,
        specifications: formValue.specifications.map((spec: any) => ({
            definitionId: spec.definitionId,
            value: spec.value
        }))
    };
    
    const operation = this.isEditMode && this.productId
      ? this.productService.update(this.productId, productData as Product)
      : this.productService.create(productData as Product);

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
