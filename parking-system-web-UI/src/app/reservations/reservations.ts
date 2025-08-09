import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParkingService } from '../services/parking.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface BookingWithDetails {
  _id: string;
  carId: {
    make: string;
    model: string;
    licensePlate: string;
  };
  spaceId: {
    spaceNumber: string;
    floor: number;
  };
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

@Component({
  selector: 'app-reservations',
  imports: [CommonModule, RouterModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ReservationsComponent implements OnInit {
  bookings: BookingWithDetails[] = [];
  filteredBookings: BookingWithDetails[] = [];
  selectedFilter = 'all';
  isLoading = false;
  isCancelling = false;

  constructor(private parkingService: ParkingService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.parkingService.getUserBookings().subscribe({
      next: (response) => {
        if (response.success) {
          this.bookings = response.data;
          console.log('Loaded bookings:', this.bookings);
          this.filterBookings();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    });
  }

  filterBookings() {
    if (this.selectedFilter === 'all') {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(booking => booking.status === this.selectedFilter);
    }
  }

  cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    console.log('Cancelling booking with ID:', bookingId);
    this.isCancelling = true;
    this.parkingService.cancelBooking(bookingId).subscribe({
      next: (response) => {
        if (response.success) {
          // Update the booking status locally
          const booking = this.bookings.find(b => b._id === bookingId);
          if (booking) {
            booking.status = 'cancelled';
          }
          this.filterBookings();
          alert('Reservation cancelled successfully!');
        }
        this.isCancelling = false;
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        console.error('Booking ID:', bookingId);
        console.error('Full error:', error);
        alert('Failed to cancel reservation. Please try again.');
        this.isCancelling = false;
      }
    });
  }

  formatDateTime(dateTime: Date | string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  calculateDuration(startTime: Date | string, endTime: Date | string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  }
}