import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Ticket {
  _id: string;
  bookingId: string;
  ticketNumber: string;
  qrCode: string;
  status: string;
  expiryTime: Date;
  isUsed: boolean;
}

export interface QRValidationResult {
  valid: boolean;
  message: string;
  ticket?: Ticket;
  booking?: any;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/api/ticket`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getTokenFromCache();
    return { 'Authorization': `Bearer ${token}` };
  }

  generateTicket(bookingId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/generate`, { bookingId }, {
      headers: this.getAuthHeaders()
    });
  }

  validateTicket(qrToken: string): Observable<any> {
    // Validation endpoint doesn't require authentication
    return this.http.post(`${this.apiUrl}/validate`, { qrToken });
  }

  validateQRCode(qrData: string): Observable<QRValidationResult> {
    return this.validateTicket(qrData);
  }

  getUserTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-tickets`, {
      headers: this.getAuthHeaders()
    });
  }

  markTicketAsUsed(ticketId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-used`, { ticketId });
  }
}