import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StatisticsService } from '../../services/statistics.service';
import { LoadingService } from '../../services/loading.service';

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
    private authService: AuthService,
    private statisticsService: StatisticsService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    if (!this.isAdmin()) {
      this.router.navigate(['/tabs/tab1']);
      return;
    }
    this.loadStats();
  }

  async loadStats() {
    await this.loadingService.show('Loading statistics...');
    
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
      // Keep default values as fallback
      this.stats = {
        totalBookings: 0,
        activeSessions: 0,
        totalUsers: 0,
        revenueToday: 0
      };
    } finally {
      await this.loadingService.hide();
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

  viewSystemLogs() {
    this.router.navigate(['/system-logs']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}