import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AdminDashboardPage implements OnInit {
  activeSection = 'overview';
  
  stats = {
    totalBookings: 156,
    activeSessions: 23,
    totalUsers: 89,
    revenueToday: 12450
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.router.navigate(['/tabs/tab1']);
    }
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  goToQRScanner() {
    this.router.navigate(['/qr-scanner']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}