// frontend/src/app/features/reviews/review-list/review-list.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Review, ProductReviewSummary } from '../../../shared/models/review.model';
import { ReviewService } from '../review.service';
import { AuthService } from '../../../auth/auth.service';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { ReviewFormDialogComponent } from '../review-form-dialog/review-form-dialog.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    StarRatingComponent
  ],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  @Input() productId!: number;
  
  reviews: Review[] = [];
  summary: ProductReviewSummary | null = null;
  myReview: Review | null = null;
  isLoading = true;
  
  // Pagination
  totalReviews = 0;
  pageSize = 10;
  pageIndex = 0;
  
  private reviewService = inject(ReviewService);
  public authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadReviewSummary();
    this.loadReviews();
    if (this.authService.isLoggedIn()) {
      this.loadMyReview();
    }
  }

  loadReviewSummary(): void {
    this.reviewService.getProductReviewSummary(this.productId).subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (err) => {
        console.error('Error loading review summary:', err);
      }
    });
  }

  loadReviews(): void {
    this.isLoading = true;
    this.reviewService.getProductReviews(this.productId, this.pageIndex, this.pageSize).subscribe({
      next: (page) => {
        this.reviews = page.content;
        this.totalReviews = page.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading reviews:', err);
      }
    });
  }

  loadMyReview(): void {
    this.reviewService.getMyReviewForProduct(this.productId).subscribe({
      next: (review) => {
        this.myReview = review;
      },
      error: (err) => {
        console.error('Error loading my review:', err);
      }
    });
  }

  openReviewDialog(): void {
    const dialogRef = this.dialog.open(ReviewFormDialogComponent, {
      width: '600px',
      data: {
        productId: this.productId,
        review: this.myReview
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadReviewSummary();
        this.loadReviews();
        this.loadMyReview();
      }
    });
  }

  deleteReview(review: Review): void {
    if (confirm('Sigur dorești să ștergi această recenzie?')) {
      this.reviewService.deleteReview(review.id!).subscribe({
        next: () => {
          this.snackBar.open('Recenzie ștearsă cu succes!', 'OK', { duration: 3000 });
          this.loadReviewSummary();
          this.loadReviews();
          if (review.userId === this.authService.getCurrentUser()?.id) {
            this.myReview = null;
          }
        },
        error: (err) => {
          this.snackBar.open('Eroare la ștergerea recenziei', 'Închide', { duration: 3000 });
        }
      });
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReviews();
  }

  canEditReview(review: Review): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser !== null && (review.userId === currentUser.id || this.authService.role === 'admin');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ro-RO');
  }

  getRatingPercentage(rating: number): number {
    if (!this.summary || this.summary.totalReviews === 0) return 0;
    return (this.summary.ratingDistribution[rating] / this.summary.totalReviews) * 100;
  }
}