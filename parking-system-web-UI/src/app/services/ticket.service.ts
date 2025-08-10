import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = '/api/ticket';

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
    return this.http.post(`${this.apiUrl}/validate`, { qrToken });
  }

  getUserTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-tickets`, {
      headers: this.getAuthHeaders()
    });
  }
}