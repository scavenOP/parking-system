import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/user';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders() {
    const token = this.authService.getTokenFromCache();
    return { 'Authorization': `Bearer ${token}` };
  }

  getUserProfile(): Observable<any> {
    console.log('UserService: Loading user profile');
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(profileData: any): Observable<any> {
    console.log('UserService: Updating user profile', profileData);
    return this.http.put(`${this.apiUrl}/profile`, profileData, {
      headers: this.getAuthHeaders()
    });
  }

  updateNotifications(notifications: any): Observable<any> {
    console.log('UserService: Updating notifications', notifications);
    return this.http.put(`${this.apiUrl}/notifications`, notifications, {
      headers: this.getAuthHeaders()
    });
  }

  updatePreferences(preferences: any): Observable<any> {
    console.log('UserService: Updating preferences', preferences);
    return this.http.put(`${this.apiUrl}/preferences`, preferences, {
      headers: this.getAuthHeaders()
    });
  }

  changePassword(passwordData: any): Observable<any> {
    console.log('UserService: Changing password');
    return this.http.put(`${this.apiUrl}/change-password`, passwordData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAccount(): Observable<any> {
    console.log('UserService: Deleting account');
    return this.http.delete(`${this.apiUrl}/account`, {
      headers: this.getAuthHeaders()
    });
  }
}