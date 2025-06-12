import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { ReportService } from '../../admin/services/report.service';
import { GeneralReport } from '../../../shared/models/report.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  reportForm!: FormGroup;
  generalReport: GeneralReport | null = null;
  isLoading = false;
  
  // Variabile pentru grafice
  salesChart: Chart | null = null;
  stockChart: Chart | null = null;
  
  // Configurări pentru tabel
  displayedProductColumns = ['productName', 'category', 'quantitySold', 'revenue', 'currentStock'];
  displayedStockColumns = ['productName', 'category', 'currentStock', 'stockValue'];
  displayedUserColumns = ['username', 'email', 'registrationDate', 'isActive'];

  private fb = inject(FormBuilder);
  private reportService = inject(ReportService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    this.reportForm = this.fb.group({
      startDate: [lastMonth, Validators.required],
      endDate: [today, Validators.required],
      reportType: ['general', Validators.required]
    });
  }

  generateReport(): void {
    if (this.reportForm.invalid) {
      this.snackBar.open('Selectați perioada pentru raport', 'OK', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const { startDate, endDate } = this.reportForm.value;

    this.reportService.generateGeneralReport(startDate, endDate).subscribe({
      next: (report) => {
        this.generalReport = report;
        this.isLoading = false;
        this.snackBar.open('Raport generat cu succes!', 'OK', { duration: 3000 });
        
        // Actualizează graficele după primirea datelor
        setTimeout(() => {
          this.updateCharts();
        }, 100);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Eroare la generarea raportului', 'Închide', { duration: 5000 });
        console.error('Report generation error:', err);
      }
    });
  }

  updateCharts(): void {
    if (!this.generalReport) return;

    // Grafic vânzări
    this.createSalesChart();
    
    // Grafic stoc pe categorii
    this.createStockChart();
  }

  createSalesChart(): void {
    const canvas = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!canvas || !this.generalReport) return;

    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const salesData = this.generalReport.salesReport.dailySales;
    
    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: salesData.map(d => new Date(d.date).toLocaleDateString('ro-RO')),
        datasets: [{
          label: 'Vânzări zilnice (RON)',
          data: salesData.map(d => d.revenue),
          borderColor: '#448AFF',
          backgroundColor: 'rgba(68, 138, 255, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#ccc'
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: '#333'
            },
            ticks: {
              color: '#ccc'
            }
          },
          y: {
            grid: {
              color: '#333'
            },
            ticks: {
              color: '#ccc',
              callback: function(value) {
                return value + ' RON';
              }
            }
          }
        }
      }
    });
  }

  createStockChart(): void {
    const canvas = document.getElementById('stockChart') as HTMLCanvasElement;
    if (!canvas || !this.generalReport) return;

    if (this.stockChart) {
      this.stockChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stockData = this.generalReport.stockReport.categoryStock;
    
    this.stockChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: stockData.map(c => c.category),
        datasets: [{
          data: stockData.map(c => c.totalStock),
          backgroundColor: [
            '#448AFF',
            '#FF6B6B',
            '#4ECDC4',
            '#45B7D1',
            '#F7DC6F',
            '#BB8FCE'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#ccc'
            }
          }
        }
      }
    });
  }

  downloadReport(format: 'pdf' | 'excel'): void {
    if (!this.reportForm.valid) {
      this.snackBar.open('Selectați perioada pentru raport', 'OK', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const { startDate, endDate } = this.reportForm.value;

    this.reportService.downloadReport(format, startDate, endDate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `raport_${new Date().toISOString().split('T')[0]}.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
        this.snackBar.open(`Raport ${format.toUpperCase()} descărcat!`, 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Eroare la descărcarea raportului', 'Închide', { duration: 5000 });
        console.error('Download error:', err);
      }
    });
  }

  getStockStatusColor(stock: number): string {
    if (stock === 0) return 'warn';
    if (stock < 10) return 'accent';
    return 'primary';
  }

  ngOnDestroy(): void {
    if (this.salesChart) {
      this.salesChart.destroy();
    }
    if (this.stockChart) {
      this.stockChart.destroy();
    }
  }
}