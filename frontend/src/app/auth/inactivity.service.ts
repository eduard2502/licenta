import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Subject, fromEvent, merge, timer } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  private inactivityTime = 60 * 60 * 1000; // 1 hour
  private destroy$ = new Subject<void>();
  private timer$ = new Subject<void>();

  startWatching(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    // Events to track user activity
    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'click'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'touchstart')
    );

    // Reset timer on any activity
    activityEvents$
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.resetTimer();
      });

    this.resetTimer();
  }

  stopWatching(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.timer$.next();
    this.timer$.complete();
  }

  private resetTimer(): void {
    this.timer$.next();

    timer(this.inactivityTime)
      .pipe(takeUntil(this.timer$), takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('User inactive for 30 minutes, logging out...');
        this.authService.logout();
        this.router.navigate(['/login'], { 
          queryParams: { reason: 'inactivity' } 
        });
      });
  }
}