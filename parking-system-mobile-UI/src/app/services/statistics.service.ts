import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/api/statistics`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getTokenFromCache();
    return { 'Authorization': `Bearer ${token}` };
  }

  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-stats`, {
      headers: this.getAuthHeaders()
    });
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-stats`, {
      headers: this.getAuthHeaders()
    });
  }
}