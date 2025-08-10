import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = '/api/ticket';

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

  generateTicket(bookingId: string): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/generate`, {
      bookingId,
      userId
    });
  }

  validateTicket(qrToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, {
      qrToken
    });
  }

  getUserTickets(): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.get(`${this.apiUrl}/my-tickets`, {
      params: { userId }
    });
  }
}