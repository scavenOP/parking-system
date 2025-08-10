import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = '/api/payment';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getTokenFromCache();
    return { 'Authorization': `Bearer ${token}` };
  }

  getPaymentHistory(period: string = '30'): Observable<any> {
    console.log('PaymentService: Loading payment history for period:', period);
    return this.http.get(`${this.apiUrl}/history?period=${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  createOrder(orderData: any): Observable<any> {
    console.log('PaymentService: Creating payment order', orderData);
    return this.http.post(`${this.apiUrl}/create-order`, orderData, {
      headers: this.getAuthHeaders()
    });
  }

  verifyPayment(paymentData: any): Observable<any> {
    console.log('PaymentService: Verifying payment', paymentData);
    return this.http.post(`${this.apiUrl}/verify`, paymentData, {
      headers: this.getAuthHeaders()
    });
  }

  createPaymentOrder(bookingId: string): Observable<any> {
    console.log('PaymentService: Creating payment order for booking:', bookingId);
    return this.http.post(`${this.apiUrl}/create-order`, { bookingId }, {
      headers: this.getAuthHeaders()
    });
  }

  handlePaymentFailure(orderId: string, reason: string): Observable<any> {
    console.log('PaymentService: Handling payment failure', { orderId, reason });
    return this.http.post(`${this.apiUrl}/failure`, { orderId, reason }, {
      headers: this.getAuthHeaders()
    });
  }
}