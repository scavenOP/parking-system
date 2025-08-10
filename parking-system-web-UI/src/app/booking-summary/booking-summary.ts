import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ParkingService } from '../services/parking.service';
import { PaymentService } from '../services/payment.service';
import { trigger, transition, style, animate } from '@angular/animations';

declare var Razorpay: any;

@Component({
  selector: 'app-booking-summary',
  imports: [CommonModule],
  templateUrl: './booking-summary.html',
  styleUrl: './booking-summary.scss',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BookingSummaryComponent implements OnInit {
  bookingData: any = {};
  isProcessing = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private parkingService: ParkingService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    // Get booking data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.bookingData = navigation.extras.state['bookingData'];
    } else {
      // Redirect back if no booking data
      this.router.navigate(['/parking-search']);
    }
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

  goBack() {
    this.router.navigate(['/parking-search']);
  }

  async proceedToPayment() {
    console.log('=== PAYMENT FLOW STARTED ===');
    console.log('Booking data:', this.bookingData);
    console.log('Razorpay available:', typeof Razorpay !== 'undefined');
    
    this.isProcessing = true;
    
    try {
      // First create the booking with pending payment status
      console.log('Creating booking with data:', {
        carId: this.bookingData.carId,
        spaceId: this.bookingData.spaceId,
        startTime: this.bookingData.startTime,
        endTime: this.bookingData.endTime
      });
      
      const bookingResponse = await this.parkingService.createBooking({
        carId: this.bookingData.carId,
        spaceId: this.bookingData.spaceId,
        startTime: this.bookingData.startTime,
        endTime: this.bookingData.endTime
      }).toPromise();

      console.log('Booking response:', bookingResponse);

      if (bookingResponse.success) {
        const bookingId = bookingResponse.data._id;
        console.log('Booking created with ID:', bookingId);
        
        // Create payment order
        const orderResponse = await this.paymentService.createPaymentOrder(bookingId).toPromise();
        console.log('Payment order response:', orderResponse);
        
        if (orderResponse.success) {
          this.initiateRazorpayPayment(orderResponse.data, bookingId);
        } else {
          console.error('Failed to create payment order:', orderResponse);
          alert('Failed to create payment order. Please try again.');
        }
      }
    } catch (error) {
      console.error('=== PAYMENT FLOW ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', (error as any).message);
      console.error('Error response:', (error as any).error);
      
      const errorMessage = (error as any).error?.message || 'Failed to initiate payment. Please try again.';
      alert(errorMessage);
      this.isProcessing = false;
    }
  }

  initiateRazorpayPayment(orderData: any, bookingId: string) {
    console.log('=== RAZORPAY INITIALIZATION ===');
    console.log('Full order data:', JSON.stringify(orderData, null, 2));
    console.log('Razorpay key:', orderData.key);
    console.log('Razorpay script loaded:', typeof Razorpay !== 'undefined');
    console.log('Window Razorpay:', (window as any).Razorpay);
    
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Smart City Parking',
      description: 'Parking Space Booking',
      order_id: orderData.orderId,
      handler: (response: any) => {
        console.log('Razorpay success response:', response);
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

    console.log('Razorpay options:', options);
    
    if (!options.key) {
      console.error('Razorpay key is missing!');
      alert('Payment configuration error. Please try again.');
      this.isProcessing = false;
      return;
    }

    const rzp = new Razorpay(options);
    rzp.open();
  }

  async verifyPayment(response: any, bookingId: string) {
    try {
      console.log('=== PAYMENT VERIFICATION ===');
      console.log('Razorpay response:', response);
      console.log('Booking ID:', bookingId);
      
      const verifyResponse = await this.paymentService.verifyPayment(response).toPromise();
      console.log('Verify response:', verifyResponse);
      
      if (verifyResponse.success) {
        alert('Payment successful! Your parking space is confirmed.');
        this.router.navigate(['/reservations']);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
      this.router.navigate(['/reservations']);
    }
    this.isProcessing = false;
  }

  async handlePaymentFailure(orderId: string, reason: string) {
    try {
      await this.paymentService.handlePaymentFailure(orderId, reason).toPromise();
      alert('Payment failed. Your space is held for 5 minutes. You can retry from reservations.');
    } catch (error) {
      console.error('Payment failure handling error:', error);
    }
    this.router.navigate(['/reservations']);
    this.isProcessing = false;
  }
}