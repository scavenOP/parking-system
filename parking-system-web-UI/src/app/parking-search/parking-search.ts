import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ParkingService, Car, ParkingSpace, Booking } from '../services/parking.service';
import { PaymentService } from '../services/payment.service';
import { trigger, transition, style, animate } from '@angular/animations';

declare var Razorpay: any;


@Component({
  selector: 'app-parking-search',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parking-search.html',
  styleUrl: './parking-search.scss',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ParkingSearchComponent implements OnInit {
  searchForm: FormGroup;
  availableCars: Car[] = [];
  availableSpaces: ParkingSpace[] = [];
  allSpaces: ParkingSpace[] = [];
  selectedSpace: ParkingSpace | null = null;
  selectedFloorView = 1;
  isSearching = false;
  isBooking = false;
  hasSearched = false;
  calculatedAmount = 0;
  isCalculatingAmount = false;

  constructor(
    private fb: FormBuilder,
    private parkingService: ParkingService,
    private paymentService: PaymentService,
    private router: Router
  ) {
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60 * 1000); // Current time + 30 minutes
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour after start time

    this.searchForm = this.fb.group({
      startTime: [this.formatDateTime(startTime), Validators.required],
      endTime: [this.formatDateTime(endTime), Validators.required],
      selectedCar: ['', Validators.required],
      selectedFloor: ['']
    }, { validators: this.dateTimeValidator });
  }

  ngOnInit() {
    this.initializeParkingSpaces();
    // Load cars when form values change
    this.searchForm.get('startTime')?.valueChanges.subscribe(() => {
      this.loadAvailableCars();
      if (this.selectedSpace) this.calculateAmountFromServer();
    });
    this.searchForm.get('endTime')?.valueChanges.subscribe(() => {
      this.loadAvailableCars();
      if (this.selectedSpace) this.calculateAmountFromServer();
    });
    // Initial load
    this.loadAvailableCars();
  }

  formatDateTime(date: Date): string {
    // Adjust for local timezone to prevent date shifting
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  }

  loadAvailableCars() {
    // First try to get all user cars, then filter available ones
    this.parkingService.getUserCars().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableCars = response.data;
          console.log('Loaded cars:', this.availableCars);
        }
      },
      error: (error) => {
        console.error('Error loading cars:', error);
        // Fallback to available cars API
        const startTime = new Date(this.searchForm.get('startTime')?.value);
        const endTime = new Date(this.searchForm.get('endTime')?.value);
        this.parkingService.getAvailableCars(startTime, endTime).subscribe({
          next: (response) => {
            if (response.success) {
              this.availableCars = response.data;
            }
          },
          error: (error) => console.error('Error loading available cars:', error)
        });
      }
    });
  }

  initializeParkingSpaces() {
    this.parkingService.initializeParkingSpaces().subscribe({
      next: () => console.log('Parking spaces initialized'),
      error: (error) => console.error('Error initializing spaces:', error)
    });
  }

  searchSpaces() {
    if (this.searchForm.invalid) return;

    this.isSearching = true;
    this.hasSearched = true;
    const formValue = this.searchForm.value;
    const startTime = new Date(formValue.startTime);
    const endTime = new Date(formValue.endTime);
    const floor = formValue.selectedFloor ? parseInt(formValue.selectedFloor) : undefined;

    this.parkingService.getAvailableSpaces(startTime, endTime, floor).subscribe({
      next: (response) => {
        if (response.success) {
          this.availableSpaces = response.data;
          this.generateAllSpaces();
        }
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching spaces:', error);
        this.isSearching = false;
      }
    });
  }

  generateAllSpaces() {
    this.allSpaces = [];
    for (let floor = 1; floor <= 3; floor++) {
      for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 5; col++) {
          const spaceNumber = `${floor}${row.toString().padStart(2, '0')}${col}`;
          const existingSpace = this.availableSpaces.find(s => s.spaceNumber === spaceNumber);
          
          this.allSpaces.push({
            _id: existingSpace?._id || `temp-${spaceNumber}`,
            spaceNumber,
            floor,
            position: { row, column: col },
            isActive: true,
            isOccupied: !existingSpace
          });
        }
      }
    }
  }

  getFloorSpaces(floor: number): ParkingSpace[] {
    return this.allSpaces.filter(space => space.floor === floor);
  }

  getFloorSpaceCount(floor: number): number {
    return this.availableSpaces.filter(space => space.floor === floor).length;
  }

  isSpaceAvailable(space: ParkingSpace): boolean {
    return this.availableSpaces.some(s => s.spaceNumber === space.spaceNumber);
  }

  selectSpace(space: ParkingSpace) {
    if (this.isSpaceAvailable(space)) {
      this.selectedSpace = space;
      this.calculateAmountFromServer();
    }
  }

  getSelectedCarDetails(): string {
    const carId = this.searchForm.get('selectedCar')?.value;
    const car = this.availableCars.find(c => c._id === carId);
    return car ? `${car.make} ${car.model} - ${car.licensePlate}` : '';
  }

  calculateDuration(): number {
    const startTime = new Date(this.searchForm.get('startTime')?.value);
    const endTime = new Date(this.searchForm.get('endTime')?.value);
    return Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  }

  calculateAmountFromServer() {
    if (!this.searchForm.get('startTime')?.value || !this.searchForm.get('endTime')?.value) {
      this.calculatedAmount = 0;
      return;
    }

    this.isCalculatingAmount = true;
    const startTime = new Date(this.searchForm.get('startTime')?.value);
    const endTime = new Date(this.searchForm.get('endTime')?.value);

    this.parkingService.calculateAmount(startTime, endTime).subscribe({
      next: (response) => {
        if (response.success) {
          this.calculatedAmount = response.data.amount;
        }
        this.isCalculatingAmount = false;
      },
      error: (error) => {
        console.error('Error calculating amount:', error);
        const errorMessage = error.error?.message || 'Error calculating amount';
        console.warn('Amount calculation failed:', errorMessage);
        this.calculatedAmount = 0;
        this.isCalculatingAmount = false;
      }
    });
  }

  dateTimeValidator(group: FormGroup) {
    const startTime = group.get('startTime')?.value;
    const endTime = group.get('endTime')?.value;
    
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const now = new Date();
      
      if (start < now) {
        return { pastStartTime: true };
      }
      if (end <= start) {
        return { endTimeBeforeStart: true };
      }
    }
    return null;
  }

  async bookSpace() {
    if (!this.selectedSpace || this.searchForm.invalid) return;

    this.isBooking = true;
    
    try {
      // Create booking first
      const booking: Booking = {
        carId: this.searchForm.get('selectedCar')?.value,
        spaceId: this.selectedSpace._id,
        startTime: new Date(this.searchForm.get('startTime')?.value),
        endTime: new Date(this.searchForm.get('endTime')?.value)
      };

      const bookingResponse = await this.parkingService.createBooking(booking).toPromise();
      
      if (bookingResponse.success) {
        const bookingId = bookingResponse.data._id;
        
        // Create payment order and open Razorpay
        const orderResponse = await this.paymentService.createPaymentOrder(bookingId).toPromise();
        
        if (orderResponse.success) {
          this.initiateRazorpayPayment(orderResponse.data, bookingId);
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = (error as any).error?.message || 'Failed to create booking. Please try again.';
      alert(errorMessage);
      this.isBooking = false;
    }
  }

  initiateRazorpayPayment(orderData: any, bookingId: string) {
    console.log('=== PARKING SEARCH RAZORPAY INIT ===');
    console.log('Order data:', orderData);
    console.log('Key field:', orderData.key);
    
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Smart City Parking',
      description: `Parking Space ${this.selectedSpace?.spaceNumber}`,
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
      console.error('Razorpay key missing in parking-search!');
      alert('Payment configuration error. Please try again.');
      this.isBooking = false;
      return;
    }

    const rzp = new Razorpay(options);
    rzp.open();
  }

  async verifyPayment(response: any, bookingId: string) {
    try {
      console.log('=== PARKING SEARCH PAYMENT VERIFICATION ===');
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
    this.isBooking = false;
  }

  async handlePaymentFailure(orderId: string, reason: string) {
    try {
      await this.paymentService.handlePaymentFailure(orderId, reason).toPromise();
      alert('Payment failed. Your space is held for 5 minutes. You can retry from reservations.');
    } catch (error) {
      console.error('Payment failure handling error:', error);
    }
    this.router.navigate(['/reservations']);
    this.isBooking = false;
  }
}