import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = '/api/payment';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getCurrentUserId(): string {
    const userData = this.cookieService.get('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.UserId;
    }
    return '';
  }

  createPaymentOrder(bookingId: string): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/create-order`, {
      bookingId,
      userId
    });
  }

  verifyPayment(paymentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, paymentData);
  }

  handlePaymentFailure(orderId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/failure`, {
      orderId,
      reason
    });
  }

  getPaymentHistory(): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.get(`${this.apiUrl}/history`, {
      params: { userId }
    });
  }

  getPaymentDetails(paymentId: string): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.get(`${this.apiUrl}/${paymentId}`, {
      params: { userId }
    });
  }
}