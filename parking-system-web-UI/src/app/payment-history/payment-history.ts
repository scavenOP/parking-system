import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../services/payment.service';

@Component({
  selector: 'app-payment-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.scss'
})
export class PaymentHistoryComponent implements OnInit {
  payments: any[] = [];
  filteredPayments: any[] = [];
  filterPeriod = '30';
  filterStatus = 'all';
  isLoading = false;
  
  totalSpent = 0;
  totalPayments = 0;
  successRate = 0;

  constructor(
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading = true;
    console.log('PaymentHistory: Loading payments for period:', this.filterPeriod);
    
    this.paymentService.getPaymentHistory(this.filterPeriod).subscribe({
      next: (response) => {
        console.log('PaymentHistory: Payments loaded successfully', response);
        this.isLoading = false;
        
        if (response.success) {
          this.payments = response.data;
          this.calculateStats();
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('PaymentHistory: Error loading payments', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.filteredPayments = this.payments.filter(payment => {
      if (this.filterStatus !== 'all' && payment.status !== this.filterStatus) {
        return false;
      }
      return true;
    });
  }

  calculateStats() {
    this.totalPayments = this.payments.length;
    this.totalSpent = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const completedPayments = this.payments.filter(p => p.status === 'completed').length;
    this.successRate = this.totalPayments > 0 ? Math.round((completedPayments / this.totalPayments) * 100) : 0;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadReceipt(payment: any) {
    // Generate receipt download
    const receiptData = {
      paymentId: payment.razorpayPaymentId,
      amount: payment.amount,
      date: payment.createdAt,
      bookingId: payment.bookingId
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${payment.razorpayPaymentId}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  retryPayment(payment: any) {
    // Navigate to booking with retry
    this.router.navigate(['/booking-summary'], { 
      queryParams: { retry: payment.bookingId } 
    });
  }

  navigateToSearch() {
    this.router.navigate(['/parking-search']);
  }
}