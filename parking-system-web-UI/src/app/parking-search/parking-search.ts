import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ParkingService, Car, ParkingSpace, Booking } from '../services/parking.service';
import { trigger, transition, style, animate } from '@angular/animations';


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
    private parkingService: ParkingService
  ) {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    this.searchForm = this.fb.group({
      startTime: [this.formatDateTime(now), Validators.required],
      endTime: [this.formatDateTime(oneHourLater), Validators.required],
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
    return date.toISOString().slice(0, 16);
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

  bookSpace() {
    if (!this.selectedSpace || this.searchForm.invalid) return;

    this.isBooking = true;
    const booking: Booking = {
      carId: this.searchForm.get('selectedCar')?.value,
      spaceId: this.selectedSpace._id,
      startTime: new Date(this.searchForm.get('startTime')?.value),
      endTime: new Date(this.searchForm.get('endTime')?.value)
      // Amount will be calculated on server side
    };

    this.parkingService.createBooking(booking).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Parking space booked successfully!');
          this.selectedSpace = null;
          this.calculatedAmount = 0;
          this.searchSpaces(); // Refresh available spaces
        }
        this.isBooking = false;
      },
      error: (error) => {
        console.error('Error booking space:', error);
        alert('Failed to book parking space. Please try again.');
        this.isBooking = false;
      }
    });
  }
}