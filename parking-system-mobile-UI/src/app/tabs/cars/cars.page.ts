import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParkingService, Car } from '../../services/parking.service';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.page.html',
  styleUrls: ['./cars.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CarsPage implements OnInit {
  cars: Car[] = [];
  isLoading = false;
  showAddForm = false;
  
  newCar: Car = {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: ''
  };

  constructor(
    private parkingService: ParkingService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadCars();
  }

  ionViewWillEnter() {
    this.loadCars();
  }

  async loadCars() {
    this.isLoading = true;
    
    try {
      const response = await this.parkingService.getUserCars().toPromise();
      
      if (response && response.data) {
        this.cars = response.data;
      } else {
        // Generate mock data for demo
        this.cars = this.generateMockCars();
      }
    } catch (error) {
      console.error('Error loading cars:', error);
      // Generate mock data for demo
      this.cars = this.generateMockCars();
    } finally {
      this.isLoading = false;
    }
  }

  generateMockCars(): Car[] {
    return [
      {
        _id: '1',
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        color: 'Silver',
        licensePlate: 'ABC-123',
        isActive: true
      },
      {
        _id: '2',
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        color: 'Blue',
        licensePlate: 'XYZ-789',
        isActive: true
      }
    ];
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newCar = {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      licensePlate: ''
    };
  }

  async addCar() {
    if (!this.isFormValid()) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (this.cars.length >= 5) {
      await this.showToast('Maximum 5 cars allowed per user', 'warning');
      return;
    }

    this.isLoading = true;
    
    try {
      const response = await this.parkingService.addCar(this.newCar).toPromise();
      
      if (response && response.success) {
        await this.showToast('Car added successfully!', 'success');
        this.loadCars();
        this.toggleAddForm();
      }
    } catch (error: any) {
      console.error('Error adding car:', error);
      const message = error.error?.message || 'Failed to add car';
      await this.showToast(message, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCar(car: Car) {
    const alert = await this.alertController.create({
      header: 'Delete Car',
      message: `Are you sure you want to delete ${car.make} ${car.model} (${car.licensePlate})?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              if (car._id) {
                await this.parkingService.deleteCar(car._id).toPromise();
              }
              await this.showToast('Car deleted successfully', 'success');
              this.loadCars();
            } catch (error) {
              console.error('Error deleting car:', error);
              await this.showToast('Failed to delete car', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  isFormValid(): boolean {
    return !!(this.newCar.make && this.newCar.model && this.newCar.color && this.newCar.licensePlate);
  }

  getCarIcon(make: string): string {
    const makeIcons: { [key: string]: string } = {
      'toyota': 'car-sport',
      'honda': 'car',
      'ford': 'car-outline',
      'bmw': 'car-sport-outline',
      'mercedes': 'car-sport',
      'audi': 'car-sport-outline'
    };
    
    return makeIcons[make.toLowerCase()] || 'car';
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