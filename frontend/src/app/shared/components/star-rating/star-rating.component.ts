// frontend/src/app/shared/components/star-rating/star-rating.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="star-rating" [class.readonly]="readonly">
      <mat-icon 
        *ngFor="let star of stars; let i = index"
        [class.filled]="i < displayRating"
        [class.half-filled]="showHalf && i === Math.floor(displayRating) && displayRating % 1 !== 0"
        (click)="!readonly && rate(i + 1)"
        (mouseenter)="!readonly && setHoverRating(i + 1)"
        (mouseleave)="!readonly && clearHoverRating()">
        {{ getStarIcon(i) }}
      </mat-icon>
      <span class="rating-text" *ngIf="showText">
        {{ displayRating.toFixed(1) }} / 5.0
        <span *ngIf="reviewCount !== undefined"> ({{ reviewCount }} {{ reviewCount === 1 ? 'recenzie' : 'recenzii' }})</span>
      </span>
    </div>
  `,
  styles: [`
    .star-rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      
      &.readonly {
        pointer-events: none;
      }
      
      mat-icon {
        color: #ddd;
        font-size: 24px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        transition: color 0.2s;
        
        &.filled {
          color: #ffc107;
        }
        
        &.half-filled {
          position: relative;
          
          &::after {
            content: 'star_half';
            position: absolute;
            left: 0;
            color: #ffc107;
          }
        }
        
        &:hover {
          transform: scale(1.1);
        }
      }
      
      .rating-text {
        margin-left: 8px;
        color: #666;
        font-size: 0.9em;
      }
    }
    
    :host-context(.readonly) mat-icon {
      cursor: default;
      
      &:hover {
        transform: none;
      }
    }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() readonly: boolean = false;
  @Input() showText: boolean = false;
  @Input() showHalf: boolean = true;
  @Input() reviewCount?: number;
  @Output() ratingChange = new EventEmitter<number>();

  stars: number[] = [1, 2, 3, 4, 5];
  hoverRating: number = 0;
  Math = Math;

  get displayRating(): number {
    return this.hoverRating || this.rating;
  }

  rate(rating: number): void {
    if (!this.readonly) {
      this.rating = rating;
      this.ratingChange.emit(rating);
    }
  }

  setHoverRating(rating: number): void {
    if (!this.readonly) {
      this.hoverRating = rating;
    }
  }

  clearHoverRating(): void {
    this.hoverRating = 0;
  }

  getStarIcon(index: number): string {
    const rating = this.displayRating;
    if (index < Math.floor(rating)) {
      return 'star';
    } else if (this.showHalf && index === Math.floor(rating) && rating % 1 >= 0.5) {
      return 'star_half';
    } else {
      return 'star_border';
    }
  }
}