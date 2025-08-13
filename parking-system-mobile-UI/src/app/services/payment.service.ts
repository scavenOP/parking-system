import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentOrder {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/api/payment`;

  constructor(private http: HttpClient) {}

  createOrder(bookingId: string, amount?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, {
      bookingId,
      amount
    });
  }

  createPaymentOrder(bookingId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, { bookingId });
  }

  verifyPayment(paymentData: PaymentVerification): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, paymentData);
  }

  handlePaymentFailure(orderId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/failure`, {
      orderId,
      reason
    });
  }

  getPaymentHistory(period: string = '30'): Observable<any> {
    return this.http.get(`${this.apiUrl}/history?period=${period}`);
  }
}