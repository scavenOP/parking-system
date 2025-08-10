import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent implements OnInit {
  isUpdating = false;
  
  userProfile = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };
  
  notifications = {
    email: true,
    sms: false,
    reminders: true
  };
  
  passwordForm = {
    current: '',
    new: '',
    confirm: ''
  };
  
  passwordErrors = {
    current: '',
    new: '',
    confirm: '',
    general: ''
  };
  
  isChangingPassword = false;
  
  preferences = {
    defaultLocation: '',
    paymentMethod: 'card',
    autoExtend: false
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadUserSettings();
  }

  loadUserSettings() {
    console.log('Settings: Loading user settings');
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        console.log('Settings: User profile loaded successfully', response);
        if (response.success) {
          this.userProfile = {
            name: response.data.Name || '',
            email: response.data.Email || '',
            phone: response.data.phone || '',
            address: response.data.Address || ''
          };
          
          this.notifications = response.data.notifications || this.notifications;
          this.preferences = response.data.preferences || this.preferences;
        }
      },
      error: (error) => {
        console.error('Settings: Error loading user profile', error);
        alert('❌ Failed to load settings');
      }
    });
  }

  updateProfile() {
    this.isUpdating = true;
    console.log('Settings: Updating user profile', this.userProfile);
    
    this.userService.updateProfile(this.userProfile).subscribe({
      next: (response) => {
        console.log('Settings: Profile updated successfully', response);
        this.isUpdating = false;
        
        if (response.success) {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            currentUser.Name = this.userProfile.name;
            currentUser.Address = this.userProfile.address;
            this.authService.setCurrentUser(currentUser);
          }
          alert('✅ Profile updated successfully!');
        } else {
          alert('❌ ' + (response.message || 'Failed to update profile'));
        }
      },
      error: (error) => {
        console.error('Settings: Error updating profile', error);
        this.isUpdating = false;
        alert('❌ Error updating profile');
      }
    });
  }

  updateNotifications() {
    console.log('Settings: Updating notifications', this.notifications);
    
    this.userService.updateNotifications(this.notifications).subscribe({
      next: (response) => {
        console.log('Settings: Notifications updated successfully', response);
        if (response.success) {
          alert('✅ Notification settings updated!');
        } else {
          alert('❌ Failed to update notifications');
        }
      },
      error: (error) => {
        console.error('Settings: Error updating notifications', error);
        alert('❌ Error updating notifications');
      }
    });
  }

  updatePreferences() {
    console.log('Settings: Updating preferences', this.preferences);
    
    this.userService.updatePreferences(this.preferences).subscribe({
      next: (response) => {
        console.log('Settings: Preferences updated successfully', response);
        if (response.success) {
          alert('✅ Preferences updated successfully!');
        } else {
          alert('❌ Failed to update preferences');
        }
      },
      error: (error) => {
        console.error('Settings: Error updating preferences', error);
        alert('❌ Error updating preferences');
      }
    });
  }

  validatePassword(): boolean {
    this.passwordErrors = { current: '', new: '', confirm: '', general: '' };
    let isValid = true;
    
    if (!this.passwordForm.current) {
      this.passwordErrors.current = 'Current password is required';
      isValid = false;
    }
    
    if (!this.passwordForm.new) {
      this.passwordErrors.new = 'New password is required';
      isValid = false;
    } else if (this.passwordForm.new.length < 6) {
      this.passwordErrors.new = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!this.passwordForm.confirm) {
      this.passwordErrors.confirm = 'Please confirm your password';
      isValid = false;
    } else if (this.passwordForm.new !== this.passwordForm.confirm) {
      this.passwordErrors.confirm = 'Passwords do not match';
      isValid = false;
    }
    
    return isValid;
  }
  
  isPasswordValid(): boolean {
    return !!this.passwordForm.current && 
           !!this.passwordForm.new && 
           !!this.passwordForm.confirm &&
           this.passwordForm.new === this.passwordForm.confirm &&
           this.passwordForm.new.length >= 6;
  }

  changePassword() {
    if (!this.validatePassword()) {
      return;
    }
    
    this.isChangingPassword = true;
    this.passwordErrors.general = '';
    
    const passwordData = {
      currentPassword: this.passwordForm.current,
      newPassword: this.passwordForm.new
    };
    
    console.log('Settings: Changing password');
    
    this.userService.changePassword(passwordData).subscribe({
      next: (response) => {
        console.log('Settings: Password changed successfully', response);
        this.isChangingPassword = false;
        
        if (response.success) {
          alert('✅ Password changed successfully!');
          this.passwordForm = { current: '', new: '', confirm: '' };
          this.passwordErrors = { current: '', new: '', confirm: '', general: '' };
        } else {
          this.passwordErrors.general = response.message || 'Failed to change password';
        }
      },
      error: (error) => {
        console.error('Settings: Error changing password', error);
        this.isChangingPassword = false;
        
        if (error.error && error.error.message) {
          this.passwordErrors.general = error.error.message;
        } else {
          this.passwordErrors.general = 'Network error. Please try again.';
        }
      }
    });
  }

  logout() {
    if (confirm('Are you sure you want to logout from all devices?')) {
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  clearData() {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      // Clear local data
      localStorage.clear();
      sessionStorage.clear();
      alert('✅ Local data cleared');
    }
  }

  deleteAccount() {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    
    if (confirmation === 'DELETE') {
      console.log('Settings: Deleting account');
      
      this.userService.deleteAccount().subscribe({
        next: (response) => {
          console.log('Settings: Account deleted successfully', response);
          if (response.success) {
            alert('✅ Account deleted successfully');
            this.authService.logout();
            this.router.navigate(['/']);
          } else {
            alert('❌ Failed to delete account');
          }
        },
        error: (error) => {
          console.error('Settings: Error deleting account', error);
          alert('❌ Error deleting account');
        }
      });
    }
  }
}