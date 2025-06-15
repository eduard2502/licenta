// frontend/src/app/shared/models/review.model.ts
export interface Review {
  id?: number;
  productId: number;
  productName?: string;
  userId: number;
  username: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export interface ReviewPage {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}