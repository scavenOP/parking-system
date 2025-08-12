import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {}

  generateTicket(bookingId: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/generate`, { bookingId });
  }

  validateQRCode(qrData: string): Observable<QRValidationResult> {
    return this.http.post<QRValidationResult>(`${this.apiUrl}/validate`, { qrData });
  }

  getUserTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/my-tickets`);
  }

  markTicketAsUsed(ticketId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-used`, { ticketId });
  }
}