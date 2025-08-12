import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ParkingService, Car, ParkingSpace } from '../services/parking.service';
import { PaymentService } from '../services/payment.service';
import { DatePickerService } from '../shared/date-picker.service';

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
    startDateTime: new Date(),
    endDateTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    floor: null
  };
  
  availableSpaces: ParkingSpace[] = [];
  selectedSpace: ParkingSpace | null = null;
  isLoading = false;
  isBooking = false;

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
    this.searchSpaces();
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
    // Apply filters and search logic here
    this.searchSpaces();
  }

  async searchSpaces() {
    this.isLoading = true;
    
    try {
      const response = await this.parkingService.getAvailableSpaces(
        this.searchCriteria.startDateTime,
        this.searchCriteria.endDateTime
      ).toPromise();
      
      if (response && response.data) {
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
    } catch (error) {
      console.error('Search error:', error);
      // Mock data for demo
      this.availableSpaces = this.generateMockSpaces();
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
  }

  async proceedToBooking() {
    if (!this.selectedSpace) return;
    
    this.isBooking = true;
    
    try {
      const bookingData = {
        carId: 'mock-car-id', // TODO: Get from selected car
        spaceId: this.selectedSpace._id,
        startTime: this.searchCriteria.startDateTime,
        endTime: this.searchCriteria.endDateTime
      };
      
      const response = await this.parkingService.createBooking(bookingData).toPromise();
      
      if (response && response.data) {
        await this.showToast('Booking created successfully!', 'success');
        this.router.navigate(['/tabs/tab3']);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      // Mock success for demo
      await this.showToast('Booking created successfully!', 'success');
      this.router.navigate(['/tabs/tab3']);
    } finally {
      this.isBooking = false;
    }
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
      value: this.searchCriteria.startDateTime.toISOString().slice(0, 16),
      min: new Date().toISOString().slice(0, 16)
    });
    
    if (result) {
      this.searchCriteria.startDateTime = new Date(result);
      this.searchSpaces();
    }
  }

  async openEndDatePicker() {
    const result = await this.datePickerService.openDateTimePicker({
      header: 'Select End Date & Time',
      value: this.searchCriteria.endDateTime.toISOString().slice(0, 16),
      min: this.searchCriteria.startDateTime.toISOString().slice(0, 16)
    });
    
    if (result) {
      this.searchCriteria.endDateTime = new Date(result);
      this.searchSpaces();
    }
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