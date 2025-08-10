import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserViewModel } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: UserViewModel | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  navigateToReservations() {
    this.router.navigate(['/reservations']);
  }

  navigateToSearch() {
    this.router.navigate(['/parking-search']);
  }

  navigateToPaymentHistory() {
    this.router.navigate(['/payment-history']);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
}