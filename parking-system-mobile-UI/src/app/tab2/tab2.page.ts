import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ParkingService, Car, ParkingSpace, Booking } from '../services/parking.service';
import { PaymentService } from '../services/payment.service';
import { DatePickerService } from '../shared/date-picker.service';

declare var Razorpay: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  searchQuery = '';
  showFilters = false;
  selectedFilter = 'available';
  
  searchCriteria = {
    startDateTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    endDateTime: new Date(Date.now() + 90 * 60 * 1000), // 1.5 hours from now
    floor: null,
    selectedCar: ''
  };
  
  availableSpaces: ParkingSpace[] = [];
  availableCars: Car[] = [];
  selectedSpace: ParkingSpace | null = null;
  isLoading = false;
  isBooking = false;
  calculatedAmount = 0;
  isCalculatingAmount = false;
  validationErrors: string[] = [];

  constructor(
    private router: Router,
    private parkingService: ParkingService,
    private paymentService: PaymentService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private datePickerService: DatePickerService
  ) {}

  ngOnInit() {
    this.loadAvailableCars();
    this.searchSpaces();
  }

  loadAvailableCars() {
    this.parkingService.getUserCars().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableCars = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading cars:', error);
        this.showToast('Failed to load vehicles', 'danger');
      }
    });
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value;
    this.filterSpaces();
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
    this.filterSpaces();
  }

  filterSpaces() {
    this.searchSpaces();
  }

  validateSearchCriteria(): boolean {
    this.validationErrors = [];
    const now = new Date();
    
    if (this.searchCriteria.startDateTime < now) {
      this.validationErrors.push('Start time cannot be in the past');
    }
    
    if (this.searchCriteria.endDateTime <= this.searchCriteria.startDateTime) {
      this.validationErrors.push('End time must be after start time');
    }
    
    if (!this.searchCriteria.selectedCar) {
      this.validationErrors.push('Please select a vehicle');
    }
    
    return this.validationErrors.length === 0;
  }

  async searchSpaces() {
    if (!this.validateSearchCriteria()) {
      this.showToast(this.validationErrors[0], 'warning');
      return;
    }

    this.isLoading = true;
    
    try {
      const response = await this.parkingService.getAvailableSpaces(
        this.searchCriteria.startDateTime,
        this.searchCriteria.endDateTime,
        this.searchCriteria.floor || undefined
      ).toPromise();
      
      if (response && response.success && response.data) {
        this.availableSpaces = response.data.map((space: any) => ({
          ...space,
          pricePerHour: space.pricePerHour || 50,
          type: space.type || 'Standard',
          isHandicapAccessible: space.isHandicapAccessible || false,
          hasEVCharging: space.hasEVCharging || Math.random() > 0.7,
          isCovered: space.isCovered || Math.random() > 0.5
        }));
      } else {
        this.availableSpaces = [];
      }
      
      this.calculateAmountFromServer();
    } catch (error) {
      console.error('Search error:', error);
      this.showToast('Failed to search spaces', 'danger');
      this.availableSpaces = [];
    } finally {
      this.isLoading = false;
    }
  }

  generateMockSpaces(): ParkingSpace[] {
    const mockSpaces: ParkingSpace[] = [];
    for (let i = 1; i <= 12; i++) {
      mockSpaces.push({
        _id: `space-${i}`,
        spaceNumber: `A${i.toString().padStart(2, '0')}`,
        floor: Math.floor((i - 1) / 4) + 1,
        position: { row: Math.floor((i - 1) / 4), column: (i - 1) % 4 },
        isActive: true,
        isOccupied: false,
        pricePerHour: 50 + (i % 3) * 10,
        type: i % 4 === 0 ? 'Premium' : 'Standard',
        isHandicapAccessible: i % 5 === 0,
        hasEVCharging: i % 3 === 0,
        isCovered: i % 2 === 0
      });
    }
    return mockSpaces;
  }

  selectSpace(space: ParkingSpace) {
    this.selectedSpace = space;
    this.calculateAmountFromServer();
  }

  calculateAmountFromServer() {
    if (!this.searchCriteria.startDateTime || !this.searchCriteria.endDateTime) {
      this.calculatedAmount = 0;
      return;
    }

    this.isCalculatingAmount = true;
    this.parkingService.calculateAmount(
      this.searchCriteria.startDateTime,
      this.searchCriteria.endDateTime
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.calculatedAmount = response.data.amount;
        }
        this.isCalculatingAmount = false;
      },
      error: (error) => {
        console.error('Error calculating amount:', error);
        // Fallback calculation
        const hours = this.getDuration();
        this.calculatedAmount = hours * 50; // Default rate
        this.isCalculatingAmount = false;
      }
    });
  }

  async proceedToBooking() {
    if (!this.selectedSpace || !this.validateSearchCriteria()) {
      this.showToast('Please fix validation errors first', 'warning');
      return;
    }
    
    this.isBooking = true;
    
    try {
      // Create booking first
      const booking: Booking = {
        carId: this.searchCriteria.selectedCar,
        spaceId: this.selectedSpace._id,
        startTime: this.searchCriteria.startDateTime,
        endTime: this.searchCriteria.endDateTime
      };

      const bookingResponse = await this.parkingService.createBooking(booking).toPromise();
      
      if (bookingResponse.success) {
        const bookingId = bookingResponse.data._id;
        
        // Create payment order and open Razorpay
        const orderResponse = await this.paymentService.createPaymentOrder(bookingId).toPromise();
        
        if (orderResponse && orderResponse.success) {
          this.initiateRazorpayPayment(orderResponse.data, bookingId);
        } else {
          throw new Error('Failed to create payment order');
        }
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error.error?.message || 'Failed to create booking. Please try again.';
      this.showToast(errorMessage, 'danger');
      this.isBooking = false;
    }
  }

  initiateRazorpayPayment(orderData: any, bookingId: string) {
    console.log('Payment order data:', orderData);
    
    const options = {
      key: orderData.key || orderData.data?.key || 'rzp_test_9WseLWo2O8lFEB',
      amount: orderData.amount || orderData.data?.amount,
      currency: orderData.currency || orderData.data?.currency || 'INR',
      name: 'Smart City Parking',
      description: `Parking Space ${this.selectedSpace?.spaceNumber}`,
      order_id: orderData.orderId || orderData.id || orderData.data?.orderId,
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
          this.handlePaymentFailure(bookingId, 'Payment cancelled by user');
        }
      }
    };

    console.log('Razorpay options:', options);

    if (!options.key) {
      this.showToast('Payment configuration error. Please try again.', 'danger');
      this.isBooking = false;
      return;
    }

    const rzp = new Razorpay(options);
    rzp.open();
  }

  async verifyPayment(response: any, bookingId: string) {
    try {
      const verifyResponse = await this.paymentService.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        bookingId: bookingId
      }).toPromise();
      
      if (verifyResponse.success) {
        this.showToast('Payment successful! Your parking space is confirmed.', 'success');
        this.router.navigate(['/tabs/tab3']);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      this.showToast('Payment verification failed. Please contact support.', 'danger');
      this.router.navigate(['/tabs/tab3']);
    }
    this.isBooking = false;
  }

  async handlePaymentFailure(bookingId: string, reason: string) {
    try {
      await this.paymentService.handlePaymentFailure(bookingId, reason).toPromise();
      this.showToast('Payment failed. Your space is held for 5 minutes. You can retry from reservations.', 'warning');
    } catch (error) {
      console.error('Payment failure handling error:', error);
    }
    this.router.navigate(['/tabs/tab3']);
    this.isBooking = false;
  }

  calculatePrice(space: ParkingSpace): number {
    const hours = this.getDuration();
    return (space.pricePerHour || 50) * hours;
  }

  getDuration(): number {
    const start = new Date(this.searchCriteria.startDateTime);
    const end = new Date(this.searchCriteria.endDateTime);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  }

  getTotalPrice(): number {
    if (!this.selectedSpace) return 0;
    return this.calculatePrice(this.selectedSpace);
  }

  async openStartDatePicker() {
    const result = await this.datePickerService.openDateTimePicker({
      header: 'Select Start Date & Time',
      value: this.formatDateTimeForInput(this.searchCriteria.startDateTime),
      min: this.formatDateTimeForInput(new Date())
    });
    
    if (result) {
      this.searchCriteria.startDateTime = new Date(result);
      // Auto-adjust end time if it's before new start time
      if (this.searchCriteria.endDateTime <= this.searchCriteria.startDateTime) {
        this.searchCriteria.endDateTime = new Date(this.searchCriteria.startDateTime.getTime() + 60 * 60 * 1000);
      }
      this.calculateAmountFromServer();
    }
  }

  async openEndDatePicker() {
    const result = await this.datePickerService.openDateTimePicker({
      header: 'Select End Date & Time',
      value: this.formatDateTimeForInput(this.searchCriteria.endDateTime),
      min: this.formatDateTimeForInput(this.searchCriteria.startDateTime)
    });
    
    if (result) {
      this.searchCriteria.endDateTime = new Date(result);
      this.calculateAmountFromServer();
    }
  }

  formatDateTimeForInput(date: Date): string {
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getSelectedCarDetails(): string {
    const car = this.availableCars.find(c => c._id === this.searchCriteria.selectedCar);
    return car ? `${car.make} ${car.model} - ${car.licensePlate}` : '';
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }
}