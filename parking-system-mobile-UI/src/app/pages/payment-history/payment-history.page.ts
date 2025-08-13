import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.page.html',
  styleUrls: ['./payment-history.page.scss'],
  standalone: false,
})
export class PaymentHistoryPage implements OnInit {
  payments: any[] = [];
  isLoading = false;
  selectedPeriod = '30';

  constructor(
    private paymentService: PaymentService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  async loadPayments() {
    await this.loadingService.show('Loading payment history...');
    this.isLoading = true;
    
    try {
      const response = await this.paymentService.getPaymentHistory(this.selectedPeriod).toPromise();
      if (response && response.success) {
        this.payments = response.data;
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      this.isLoading = false;
      await this.loadingService.hide();
    }
  }

  onPeriodChange() {
    this.loadPayments();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'danger';
      case 'pending': return 'warning';
      default: return 'medium';
    }
  }
}