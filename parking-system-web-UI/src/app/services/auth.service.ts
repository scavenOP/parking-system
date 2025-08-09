import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<UserViewModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in by checking sessionStorage
    const cachedUser = this.getUserFromCache();
    if (cachedUser) {
      this.currentUserSubject.next(cachedUser);
    }
  }

  signup(userData: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/User/signup`, userData);
  }

  signupPromise(userData: SignupRequest): Promise<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/User/signup`, userData).toPromise() as Promise<SignupResponse>;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/User/login`, credentials);
  }

  loginPromise(credentials: LoginRequest): Promise<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/User/login`, credentials).toPromise() as Promise<LoginResponse>;
  }

  setCurrentUser(user: UserViewModel): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('token', user.Token);
    }
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): UserViewModel | null {
    return this.currentUserSubject.value;
  }

  getUserFromCache(): UserViewModel | null {
    if (typeof sessionStorage !== 'undefined') {
      const storedUser = sessionStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  }

  getTokenFromCache(): string | null {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getTokenFromCache() !== null;
  }

  logout(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }
}