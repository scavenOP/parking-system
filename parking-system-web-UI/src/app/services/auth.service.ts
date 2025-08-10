import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from './cookie.service';


export interface SignupRequest {
  name: string;
  email: string;
  address: string;
  dateOfBirth: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserViewModel {
  UserId: string;
  Name: string;
  Email: string;
  DateOfBirth: string;
  Address: string;
  Role: string;
  Token: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user?: UserViewModel;
}

export interface LoginResponse {
  message: string;
  data: UserViewModel;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/User';
  private currentUserSubject = new BehaviorSubject<UserViewModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const hostUrl = `${window.location.protocol}//${window.location.host}`;
      this.apiUrl = `${hostUrl}/api/User`;
      
      const cachedUser = this.getUserFromCache();
      if (cachedUser) {
        this.currentUserSubject.next(cachedUser);
      }
    }
  }

  signup(userData: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/signup`, userData);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }


  setCurrentUser(user: UserViewModel): void {
    // Store auth token in secure cookie (enterprise pattern)
    this.cookieService.set('auth_token', user.Token, {
      expires: 7, // 7 days
      secure: true, // HTTPS only in production
      sameSite: 'strict' // CSRF protection
    });
    
    // Store user data in less secure cookie (non-sensitive data)
    this.cookieService.set('user_data', JSON.stringify({
      UserId: user.UserId,
      Name: user.Name,
      Email: user.Email,
      Role: user.Role
    }), {
      expires: 7,
      secure: false, // Can be accessed by JS
      sameSite: 'strict'
    });
    
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): UserViewModel | null {
    return this.currentUserSubject.value;
  }

  getUserFromCache(): UserViewModel | null {
    const token = this.cookieService.get('auth_token');
    const userData = this.cookieService.get('user_data');
    
    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        return {
          ...parsedUserData,
          Token: token,
          DateOfBirth: '', // Not stored in cookie for privacy
          Address: '' // Not stored in cookie for privacy
        };
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
        this.logout(); // Clear invalid data
        return null;
      }
    }
    return null;
  }

  getTokenFromCache(): string | null {
    return this.cookieService.get('auth_token') || null;
  }

  isLoggedIn(): boolean {
    return this.getTokenFromCache() !== null;
  }

  getUserRole(): string | null {
    const userData = this.cookieService.get('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.Role;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  logout(): void {
    // Clear all auth-related cookies
    this.cookieService.remove('auth_token');
    this.cookieService.remove('user_data');
    
    // Clear user state
    this.currentUserSubject.next(null);
  }
}