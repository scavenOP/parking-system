import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../services/payment.service';
import jsPDF from 'jspdf';

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
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(71, 138, 201);
    doc.text('Smart City Parking', 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Premium Parking Solutions', 20, 32);
    doc.text('123 Business District, Smart City', 20, 37);
    doc.text('Phone: +91 98765 43210 | Email: support@smartparking.com', 20, 42);
    
    // Receipt Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('PAYMENT RECEIPT', 20, 60);
    
    // Receipt Details
    doc.setFontSize(10);
    const receiptDate = new Date(payment.createdAt).toLocaleString('en-IN');
    
    doc.text(`Receipt No: ${payment.razorpayPaymentId}`, 20, 75);
    doc.text(`Date: ${receiptDate}`, 20, 82);
    doc.text(`Booking ID: ${payment.bookingId}`, 20, 89);
    
    // Payment Details Box
    doc.setDrawColor(71, 138, 201);
    doc.rect(20, 100, 170, 40);
    
    doc.setFontSize(12);
    doc.text('Payment Details', 25, 112);
    doc.setFontSize(10);
    doc.text(`Service: Parking Space Booking`, 25, 122);
    doc.text(`Amount: ₹${payment.amount}`, 25, 129);
    doc.text(`Status: ${payment.status.toUpperCase()}`, 25, 136);
    
    // Total Amount
    doc.setFontSize(14);
    doc.setTextColor(71, 138, 201);
    doc.text(`Total Paid: ₹${payment.amount}`, 20, 155);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing Smart City Parking!', 20, 180);
    doc.text('For support, contact us at support@smartparking.com', 20, 185);
    doc.text('This is a computer generated receipt.', 20, 190);
    
    // Download
    doc.save(`receipt-${payment.razorpayPaymentId}.pdf`);
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