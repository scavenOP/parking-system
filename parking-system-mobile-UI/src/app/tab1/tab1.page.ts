import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ParkingService } from '../services/parking.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  userName = '';
  stats = {
    totalCars: 0,
    activeBookings: 0,
    completedBookings: 0
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private parkingService: ParkingService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadStats();
  }

  ionViewWillEnter() {
    this.loadStats();
  }

  loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.Name;
    }
  }

  async loadStats() {
    try {
      const [carsResponse, bookingsResponse] = await Promise.all([
        this.parkingService.getUserCars().toPromise(),
        this.parkingService.getUserBookings().toPromise()
      ]);

      this.stats.totalCars = carsResponse?.data?.length || 0;
      
      if (bookingsResponse?.data) {
        const bookings = bookingsResponse.data;
        this.stats.activeBookings = bookings.filter((b: any) => b.status === 'active').length;
        this.stats.completedBookings = bookings.filter((b: any) => b.status === 'completed').length;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  goToParking() {
    this.router.navigate(['/tabs/parking']);
  }

  goToReservations() {
    this.router.navigate(['/tabs/reservations']);
  }

  goToCars() {
    this.router.navigate(['/tabs/cars']);
  }

  goToQRScanner() {
    this.router.navigate(['/qr-scanner']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
