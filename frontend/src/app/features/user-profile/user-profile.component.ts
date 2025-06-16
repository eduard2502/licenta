// frontend/src/app/features/user-profile/user-profile.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../auth/auth.service';
import { ReviewService } from '../reviews/review.service';
import { UserAdminService } from '../admin/services/user-admin.service';
import { User } from '../../shared/models/user.model';
import { Review } from '../../shared/models/review.model';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    StarRatingComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  userReviews: Review[] = [];
  isLoading = true;
  isLoadingReviews = true;
  isEditMode = false;
  profileForm!: FormGroup;
  totalReviews = 0;
  averageRating = 0;

  private authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private userService = inject(UserAdminService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserProfile();
    this.loadUserReviews();
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      fullName: [''], // For future implementation
      phone: [''], // For future implementation
      address: [''] // For future implementation
    });
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getUserById(currentUser.id).subscribe({
        next: (user) => {
          this.user = user;
          this.profileForm.patchValue({
            username: user.username,
            email: user.email
          });
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Eroare la încărcarea profilului', 'Închide', { duration: 3000 });
          console.error('Error loading profile:', err);
        }
      });
    }
  }

  loadUserReviews(): void {
    this.isLoadingReviews = true;
    // We need to add a method in review service to get reviews by user
    // For now, we'll simulate this
    this.reviewService.getUserReviews().subscribe({
      next: (reviews) => {
        this.userReviews = reviews;
        this.calculateReviewStats();
        this.isLoadingReviews = false;
      },
      error: (err) => {
        this.isLoadingReviews = false;
        console.error('Error loading reviews:', err);
      }
    });
  }

  calculateReviewStats(): void {
    this.totalReviews = this.userReviews.length;
    if (this.totalReviews > 0) {
      const totalRating = this.userReviews.reduce((sum, review) => sum + review.rating, 0);
      this.averageRating = totalRating / this.totalReviews;
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Reset form when canceling
      this.loadUserProfile();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.user) return;

    const updatedData = {
      email: this.profileForm.get('email')?.value,
      roles: this.user.roles // Keep existing roles
    };

    this.userService.updateUser(this.user.id, updatedData).subscribe({
      next: () => {
        this.snackBar.open('Profil actualizat cu succes!', 'OK', { duration: 3000 });
        this.isEditMode = false;
        this.loadUserProfile();
      },
      error: (err) => {
        this.snackBar.open('Eroare la actualizarea profilului', 'Închide', { duration: 3000 });
        console.error('Error updating profile:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}