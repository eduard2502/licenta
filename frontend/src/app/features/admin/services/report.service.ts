import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GeneralReport, SalesReport, StockReport, UserReport } from '../../../shared/models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = '/api/admin/reports';
  private http = inject(HttpClient);

  generateGeneralReport(startDate: Date, endDate: Date): Observable<GeneralReport> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));
    
    return this.http.get<GeneralReport>(`${this.apiUrl}/general`, { params })
      .pipe(catchError(this.handleError));
  }

  getSalesReport(startDate: Date, endDate: Date): Observable<SalesReport> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate));
    
    return this.http.get<SalesReport>(`${this.apiUrl}/sales`, { params })
      .pipe(catchError(this.handleError));
  }

  getStockReport(): Observable<StockReport> {
    return this.http.get<StockReport>(`${this.apiUrl}/stock`)
      .pipe(catchError(this.handleError));
  }

  getUserReport(): Observable<UserReport> {
    return this.http.get<UserReport>(`${this.apiUrl}/users`)
      .pipe(catchError(this.handleError));
  }

  downloadReport(reportType: 'pdf' | 'excel', startDate: Date, endDate: Date): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', this.formatDate(startDate))
      .set('endDate', this.formatDate(endDate))
      .set('format', reportType);
    
    return this.http.get(`${this.apiUrl}/download`, { 
      params, 
      responseType: 'blob' 
    }).pipe(catchError(this.handleError));
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'A apărut o eroare la generarea raportului.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Eroare: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Cod eroare: ${error.status}`;
    }
    console.error('Report service error:', error);
    return throwError(() => new Error(errorMessage));
  }
}