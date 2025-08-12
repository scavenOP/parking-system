import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, SignupRequest } from '../../services/auth.service';
import { DatePickerService } from '../../shared/date-picker.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SignupPage implements OnInit {
  signupData: SignupRequest = {
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    password: ''
  };
  
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
  isLoading = false;
  dateOfBirthDisplay = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private datePickerService: DatePickerService
  ) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/tabs/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async openDatePicker() {
    const result = await this.datePickerService.openDatePicker({
      header: 'Select Date of Birth',
      value: this.signupData.dateOfBirth,
      max: '2010-12-31'
    });
    
    if (result) {
      this.signupData.dateOfBirth = result;
      this.dateOfBirthDisplay = new Date(result).toLocaleDateString();
    }
  }

  passwordsMatch(): boolean {
    return this.signupData.password === this.confirmPassword && this.signupData.password.length > 0;
  }

  async onSignup() {
    if (!this.passwordsMatch()) {
      await this.showToast('Passwords do not match', 'danger');
      return;
    }

    if (!this.acceptTerms) {
      await this.showToast('Please accept the terms and conditions', 'warning');
      return;
    }

    this.isLoading = true;
    
    try {
      // Format date for backend
      if (this.signupData.dateOfBirth) {
        this.signupData.dateOfBirth = new Date(this.signupData.dateOfBirth).toISOString().split('T')[0];
      }
      
      const response = await this.authService.signup(this.signupData).toPromise();
      
      if (response && response.success) {
        await this.showToast('Account created successfully! Please login.', 'success');
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const message = error.error?.message || 'Signup failed. Please try again.';
      await this.showToast(message, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
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