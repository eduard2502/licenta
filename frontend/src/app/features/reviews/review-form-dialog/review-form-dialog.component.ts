// frontend/src/app/features/reviews/review-form-dialog/review-form-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Review, CreateReviewRequest } from '../../../shared/models/review.model';
import { ReviewService } from '../review.service';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-review-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    StarRatingComponent
  ],
  template: `
    <h2 mat-dialog-title>{{ data.review ? 'Editează recenzia' : 'Scrie o recenzie' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="reviewForm">
        <div class="rating-section">
          <label>Evaluarea ta:</label>
          <app-star-rating 
            [rating]="reviewForm.get('rating')?.value || 0"
            (ratingChange)="onRatingChange($event)">
          </app-star-rating>
          <mat-error *ngIf="reviewForm.get('rating')?.touched && reviewForm.get('rating')?.errors?.['required']">
            Te rugăm să selectezi o evaluare
          </mat-error>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titlu recenzie (opțional)</mat-label>
          <input matInput formControlName="title" placeholder="Rezumă experiența ta">
          <mat-error *ngIf="reviewForm.get('title')?.errors?.['maxlength']">
            Titlul nu poate depăși 100 de caractere
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Comentariu (opțional)</mat-label>
          <textarea matInput formControlName="comment" rows="5" 
                    placeholder="Descrie experiența ta cu acest produs"></textarea>
          <mat-error *ngIf="reviewForm.get('comment')?.errors?.['maxlength']">
            Comentariul nu poate depăși 1000 de caractere
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Anulează</button>
      <button mat-raised-button color="primary" 
              (click)="onSubmit()" 
              [disabled]="reviewForm.invalid || isSubmitting">
        {{ isSubmitting ? 'Se salvează...' : 'Salvează' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
      
      @media (max-width: 600px) {
        min-width: auto;
      }
    }
    
    .rating-section {
      margin-bottom: 20px;
      
      label {
        display: block;
        margin-bottom: 10px;
        font-weight: 500;
      }
      
      mat-error {
        display: block;
        margin-top: 5px;
      }
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class ReviewFormDialogComponent implements OnInit {
  reviewForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ReviewFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productId: number; review: Review | null }
  ) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [this.data.review?.rating || null, Validators.required],
      title: [this.data.review?.title || '', Validators.maxLength(100)],
      comment: [this.data.review?.comment || '', Validators.maxLength(1000)]
    });
  }

  onRatingChange(rating: number): void {
    this.reviewForm.patchValue({ rating });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) return;

    this.isSubmitting = true;
    const reviewData: CreateReviewRequest = {
      productId: this.data.productId,
      ...this.reviewForm.value
    };

    const operation = this.data.review
      ? this.reviewService.updateReview(this.data.review.id!, reviewData)
      : this.reviewService.createReview(reviewData);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          this.data.review ? 'Recenzie actualizată cu succes!' : 'Recenzie adăugată cu succes!',
          'OK',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMessage = err.error?.message || 'A apărut o eroare. Te rugăm să încerci din nou.';
        this.snackBar.open(errorMessage, 'Închide', { duration: 5000 });
      }
    });
  }
}