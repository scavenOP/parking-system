import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LogsViewerComponent } from '../logs-viewer/logs-viewer';
import { QrScannerComponent } from '../qr-scanner/qr-scanner';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, LogsViewerComponent, QrScannerComponent],
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
    private authService: AuthService
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

  loadStats() {
    // Mock stats - replace with actual API calls
    this.stats = {
      totalBookings: 156,
      activeSessions: 23,
      totalUsers: 89,
      revenueToday: 12450
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}