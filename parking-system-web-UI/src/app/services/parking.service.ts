import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from './cookie.service';

export interface Car {
  _id?: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  isActive?: boolean;
}

export interface ParkingSpace {
  _id: string;
  spaceNumber: string;
  floor: number;
  position: {
    row: number;
    column: number;
  };
  isActive: boolean;
  isOccupied?: boolean;
}

export interface Booking {
  _id?: string;
  carId: string;
  spaceId: string;
  startTime: Date;
  endTime: Date;
  totalAmount?: number; // Optional since calculated on server
  status?: string;
  paymentStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private apiUrl = '/api/parking';

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

  // Car Management
  addCar(car: Car): Observable<any> {
    const userId = this.getCurrentUserId();
    const carData = { ...car, userId };
    return this.http.post(`${this.apiUrl}/cars`, carData);
  }

  getUserCars(): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.get(`${this.apiUrl}/cars`, {
      params: { userId }
    });
  }

  getAvailableCars(startTime: Date, endTime: Date): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.get(`${this.apiUrl}/cars/available`, {
      params: {
        userId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }
    });
  }

  // Parking Space Management
  getAvailableSpaces(startTime: Date, endTime: Date, floor?: number): Observable<any> {
    const params: any = {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    };
    if (floor) params.floor = floor.toString();

    return this.http.get(`${this.apiUrl}/spaces/available`, { params });
  }

  initializeParkingSpaces(): Observable<any> {
    return this.http.post(`${this.apiUrl}/spaces/initialize`, {});
  }

  // Booking Management
  createBooking(booking: Booking): Observable<any> {
    const userId = this.getCurrentUserId();
    const bookingData = { ...booking, userId };
    return this.http.post(`${this.apiUrl}/bookings`, bookingData);
  }

  getUserBookings(): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.get(`${this.apiUrl}/bookings`, {
      params: { userId }
    });
  }

  deleteCar(carId: string): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.delete(`${this.apiUrl}/cars/${carId}`, {
      body: { userId }
    });
  }

  cancelBooking(bookingId: string): Observable<any> {
    const userId = this.getCurrentUserId();
    return this.http.post(`${this.apiUrl}/bookings/${bookingId}/cancel`, {
      userId
    });
  }

  calculateAmount(startTime: Date, endTime: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/calculate-amount`, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
  }
}