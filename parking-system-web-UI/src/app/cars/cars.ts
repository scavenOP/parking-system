import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ParkingService, Car } from '../services/parking.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-cars',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cars.html',
  styleUrl: './cars.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms ease-in', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ height: '0', opacity: 0 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CarsComponent implements OnInit {
  carForm: FormGroup;
  cars: Car[] = [];
  showAddForm = false;
  isSubmitting = false;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private parkingService: ParkingService
  ) {
    this.carForm = this.fb.group({
      make: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(this.currentYear + 1)]],
      color: ['', [Validators.required, Validators.minLength(2)]],
      licensePlate: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.parkingService.getUserCars().subscribe({
      next: (response) => {
        if (response.success) {
          this.cars = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading cars:', error);
      }
    });
  }

  onSubmit() {
    if (this.carForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      this.parkingService.addCar(this.carForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.cars.unshift(response.data);
            this.carForm.reset();
            this.showAddForm = false;
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error adding car:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  editCar(car: Car) {
    // Fill form with car data for editing
    this.carForm.patchValue({
      make: car.make,
      model: car.model,
      year: car.year,
      color: car.color,
      licensePlate: car.licensePlate
    });
    this.showAddForm = true;
  }

  removeCar(carId: string) {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      this.parkingService.deleteCar(carId).subscribe({
        next: (response) => {
          if (response.success) {
            this.cars = this.cars.filter(car => car._id !== carId);
          }
        },
        error: (error) => {
          console.error('Error deleting car:', error);
          alert('Failed to delete car. Please try again.');
        }
      });
    }
  }
}