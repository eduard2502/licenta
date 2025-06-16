// frontend/src/app/features/reviews/review.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, CreateReviewRequest, ProductReviewSummary, ReviewPage } from '../../shared/models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews';
  private http = inject(HttpClient);

  createReview(review: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  updateReview(reviewId: number, review: CreateReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, review);
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reviewId}`);
  }

  getProductReviews(productId: number, page: number = 0, size: number = 10): Observable<ReviewPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<ReviewPage>(`${this.apiUrl}/product/${productId}`, { params });
  }

  getProductReviewSummary(productId: number): Observable<ProductReviewSummary> {
    return this.http.get<ProductReviewSummary>(`${this.apiUrl}/product/${productId}/summary`);
  }

  getMyReviewForProduct(productId: number): Observable<Review | null> {
    return this.http.get<Review | null>(`${this.apiUrl}/product/${productId}/my-review`);
  }
  getUserReviews(): Observable<Review[]> {
  return this.http.get<Review[]>(`${this.apiUrl}/user/my-reviews`);
}
}