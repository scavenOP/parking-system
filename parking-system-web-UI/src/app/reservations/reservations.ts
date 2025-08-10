import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParkingService } from '../services/parking.service';
import { PaymentService } from '../services/payment.service';
import { TicketService } from '../services/ticket.service';
import { trigger, transition, style, animate } from '@angular/animations';

declare var Razorpay: any;

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
  paymentStatus: string;
  paymentHoldExpiry: Date;
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
  isProcessingPayment = false;
  ticketQRs: { [key: string]: string } = {};

  constructor(
    private parkingService: ParkingService,
    private paymentService: PaymentService,
    private ticketService: TicketService
  ) {}

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

  async retryPayment(bookingId: string) {
    this.isProcessingPayment = true;
    
    try {
      // Create payment order for existing booking
      const orderResponse = await this.paymentService.createPaymentOrder(bookingId).toPromise();
      
      if (orderResponse.success) {
        this.initiateRazorpayPayment(orderResponse.data, bookingId);
      }
    } catch (error) {
      console.error('Payment retry error:', error);
      alert('Failed to initiate payment. Please try again.');
      this.isProcessingPayment = false;
    }
  }

  initiateRazorpayPayment(orderData: any, bookingId: string) {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount * 100,
      currency: orderData.currency,
      name: 'Smart City Parking',
      description: 'Parking Space Booking Payment',
      order_id: orderData.orderId,
      handler: (response: any) => {
        this.verifyPayment(response, bookingId);
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com'
      },
      theme: {
        color: '#667eea'
      },
      modal: {
        ondismiss: () => {
          this.handlePaymentFailure(orderData.orderId, 'Payment cancelled by user');
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  async verifyPayment(response: any, bookingId: string) {
    try {
      const verifyResponse = await this.paymentService.verifyPayment(response).toPromise();
      
      if (verifyResponse.success) {
        alert('Payment successful! Your parking space is confirmed.');
        this.loadBookings(); // Refresh bookings
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    }
    this.isProcessingPayment = false;
  }

  async handlePaymentFailure(orderId: string, reason: string) {
    try {
      await this.paymentService.handlePaymentFailure(orderId, reason).toPromise();
      alert('Payment failed. You can retry payment within 5 minutes.');
      this.loadBookings(); // Refresh bookings to show updated status
    } catch (error) {
      console.error('Payment failure handling error:', error);
    }
    this.isProcessingPayment = false;
  }

  async loadTicket(bookingId: string) {
    try {
      const response = await this.ticketService.getUserTickets().toPromise();
      if (response.success) {
        const ticket = response.data.find((t: any) => t.bookingId._id === bookingId);
        if (ticket) {
          this.ticketQRs[bookingId] = ticket.qrCodeData;
        }
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
    }
  }

  getTicketQR(bookingId: string): string {
    return this.ticketQRs[bookingId] || '';
  }
}