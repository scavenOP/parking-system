import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  key: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/api/payment`;

  constructor(private http: HttpClient) {}

  createOrder(bookingId: string, amount: number): Observable<PaymentOrder> {
    return this.http.post<PaymentOrder>(`${this.apiUrl}/create-order`, {
      bookingId,
      amount
    });
  }

  verifyPayment(paymentData: PaymentVerification): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, paymentData);
  }

  handlePaymentFailure(bookingId: string, error: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/failure`, {
      bookingId,
      error
    });
  }

  getPaymentHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`);
  }
}