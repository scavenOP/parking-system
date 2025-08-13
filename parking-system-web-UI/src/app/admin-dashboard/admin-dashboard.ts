import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LogsViewerComponent } from '../logs-viewer/logs-viewer';
import { QrScannerComponent } from '../qr-scanner/qr-scanner';
import { LoadingComponent } from '../components/loading/loading.component';
import { AuthService } from '../services/auth.service';
import { StatisticsService } from '../services/statistics.service';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, LogsViewerComponent, QrScannerComponent, LoadingComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  activeSection: string = 'overview';
  
  stats = {
    totalBookings: 0,
    activeSessions: 0,
    totalUsers: 0,
    revenueToday: 0
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private statisticsService: StatisticsService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    // Check if user is admin
    if (!this.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loadStats();
  }

  isAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return userRole === 'Admin';
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  getSectionTitle(): string {
    const titles: { [key: string]: string } = {
      'overview': '📊 Dashboard Overview',
      'logs': '📋 System Logs',
      'scanner': '📱 QR Code Scanner',
      'bookings': '🚗 Booking Management',
      'users': '👥 User Management'
    };
    return titles[this.activeSection] || 'Admin Dashboard';
  }

  async loadStats() {
    this.loadingService.show();
    
    try {
      const response = await this.statisticsService.getAdminStats().toPromise();
      
      if (response && response.success) {
        this.stats = {
          totalBookings: response.data.totalBookings || 0,
          activeSessions: response.data.activeBookings || 0,
          totalUsers: response.data.totalUsers || 0,
          revenueToday: response.data.totalRevenue || 0
        };
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
      // Keep mock data as fallback
      this.stats = {
        totalBookings: 0,
        activeSessions: 0,
        totalUsers: 0,
        revenueToday: 0
      };
    } finally {
      this.loadingService.hide();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}