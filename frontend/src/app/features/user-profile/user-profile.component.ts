// frontend/src/app/features/user-profile/user-profile.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
import { UserProfileService } from './user-profile.service'; // New service
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
  private userProfileService = inject(UserProfileService); // Use new service
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  ngOnInit(): void {
  if (!this.authService.isLoggedIn()) {
    this.snackBar.open('Te rugăm să te autentifici pentru a vizualiza profilul.', 'OK', { duration: 3000 });
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-profile' } });
    return;
  }
  
  this.initializeForm();
  this.loadUserProfile();
  this.loadUserReviews();
}

  initializeForm(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      avatarImageBase64: [null as string | null],
      fullName: [''],
      phone: [''],
      address: ['']
    });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    
    // Use the new service to get profile data
    this.userProfileService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          avatarImageBase64: user.avatarImageBase64
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        
        // Check if it's an authentication error
        if (err.message.includes('Sesiunea a expirat')) {
          this.snackBar.open(err.message, 'Login', { duration: 5000 })
            .onAction().subscribe(() => {
              this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-profile' } });
            });
        } else {
          // For other errors, use cached data if available
          const cachedUser = this.authService.getCurrentUser();
          if (cachedUser) {
            this.user = cachedUser;
            this.profileForm.patchValue({
              username: cachedUser.username,
              email: cachedUser.email
            });
            this.snackBar.open('Folosind datele din cache. Reconectează-te pentru date actualizate.', 'OK', { duration: 3000 });
          } else {
            this.snackBar.open(err.message, 'Închide', { duration: 5000 });
            this.router.navigate(['/']);
          }
        }
      }
    });
  }

  loadUserReviews(): void {
    this.isLoadingReviews = true;
    this.reviewService.getUserReviews().subscribe({
      next: (reviews) => {
        this.userReviews = reviews;
        this.calculateReviewStats();
        this.isLoadingReviews = false;
      },
      error: (err) => {
        this.isLoadingReviews = false;
        console.error('Error loading reviews:', err);
        this.userReviews = [];
        this.calculateReviewStats();
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
      this.loadUserProfile();
    }
  }
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profileForm.patchValue({
          avatarImageBase64: reader.result as string
        });
        this.profileForm.markAsDirty();
      };
      reader.readAsDataURL(file);
    }
  }
  saveProfile(): void {
    if (this.profileForm.invalid || !this.user) return;

    const updatedData = {
      email: this.profileForm.get('email')?.value,
      avatarImageBase64: this.profileForm.get('avatarImageBase64')?.value,
      roles: undefined // Don't send roles for own profile update
    };

    this.userProfileService.updateMyProfile(updatedData).subscribe({
      next: () => {
        this.snackBar.open('Profil actualizat cu succes!', 'OK', { duration: 3000 });
        this.isEditMode = false;
        this.loadUserProfile();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Eroare la actualizarea profilului', 'Închide', { duration: 5000 });
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