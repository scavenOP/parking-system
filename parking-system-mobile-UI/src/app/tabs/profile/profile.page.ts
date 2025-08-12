import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserViewModel } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
  user: UserViewModel | null = null;
  isEditing = false;
  
  editableUser = {
    name: '',
    email: '',
    address: '',
    dateOfBirth: ''
  };
  
  stats = {
    totalBookings: 0,
    totalSpent: 0,
    totalHours: 0,
    favoriteSpot: 'N/A'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.loadUserStats();
  }

  ionViewWillEnter() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.editableUser = {
        name: this.user.Name || '',
        email: this.user.Email || '',
        address: this.user.Address || '',
        dateOfBirth: this.user.DateOfBirth || ''
      };
    } else {
      // Mock user data for demo
      this.user = {
        UserId: 'demo-user-id',
        Name: 'John Doe',
        Email: 'john.doe@example.com',
        DateOfBirth: '1990-01-15',
        Address: '123 Main St, City, State',
        Role: 'User',
        Token: 'demo-token'
      };
      
      this.editableUser = {
        name: this.user.Name,
        email: this.user.Email,
        address: this.user.Address,
        dateOfBirth: this.user.DateOfBirth
      };
    }
  }

  loadUserStats() {
    // Mock stats for demo
    this.stats = {
      totalBookings: 24,
      totalSpent: 1250,
      totalHours: 48,
      favoriteSpot: 'Floor 2 - A15'
    };
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    
    if (!this.isEditing && this.user) {
      // Reset to original values if cancelled
      this.editableUser = {
        name: this.user.Name || '',
        email: this.user.Email || '',
        address: this.user.Address || '',
        dateOfBirth: this.user.DateOfBirth || ''
      };
    }
  }

  async saveProfile() {
    if (!this.isFormValid()) {
      await this.showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      // In a real app, you would call an API to update the profile
      // await this.authService.updateProfile(this.editableUser).toPromise();
      
      // Mock success for demo
      if (this.user) {
        this.user.Name = this.editableUser.name;
        this.user.Email = this.editableUser.email;
        this.user.Address = this.editableUser.address;
        this.user.DateOfBirth = this.editableUser.dateOfBirth;
      }
      
      await this.showToast('Profile updated successfully!', 'success');
      this.isEditing = false;
    } catch (error) {
      console.error('Error updating profile:', error);
      await this.showToast('Failed to update profile', 'danger');
    }
  }

  isFormValid(): boolean {
    return !!(this.editableUser.name && this.editableUser.email);
  }

  async changePassword() {
    const alert = await this.alertController.create({
      header: 'Change Password',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Current Password'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'New Password'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirm New Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Change',
          handler: async (data) => {
            if (data.newPassword !== data.confirmPassword) {
              await this.showToast('Passwords do not match', 'danger');
              return false;
            }
            
            if (data.newPassword.length < 6) {
              await this.showToast('Password must be at least 6 characters', 'danger');
              return false;
            }
            
            // Mock success
            await this.showToast('Password changed successfully!', 'success');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: 'Are you sure you want to permanently delete your account? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            await this.showToast('Account deletion feature coming soon', 'primary');
          }
        }
      ]
    });

    await alert.present();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
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