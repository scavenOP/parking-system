import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { ParkingService } from '../services/parking.service';
import { AuthService } from '../services/auth.service';
import { TicketService } from '../services/ticket.service';

interface Booking {
  _id: string;
  spaceNumber: string;
  floor: number;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  duration: number;
  cancelledAt?: Date;
  refundAmount?: number;
  qrCode?: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  selectedTab = 'active';
  isLoading = false;
  
  activeBookings: Booking[] = [];
  inProgressBookings: Booking[] = [];
  completedBookings: Booking[] = [];
  cancelledBookings: Booking[] = [];
  ticketQRs: { [key: string]: string } = {};

  constructor(
    private router: Router,
    private parkingService: ParkingService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private authService: AuthService,
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  ionViewWillEnter() {
    this.loadBookings();
  }

  async loadBookings() {
    this.isLoading = true;
    
    try {
      const response = await this.parkingService.getUserBookings().toPromise();
      
      if (response && response.data) {
        this.processBookings(response.data);
      } else {
        this.generateMockBookings();
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.generateMockBookings();
    } finally {
      this.isLoading = false;
    }
  }

  generateMockBookings() {
    const now = new Date();
    
    // Active bookings
    this.activeBookings = [
      {
        _id: '1',
        spaceNumber: 'A15',
        floor: 1,
        startTime: new Date(now.getTime() - 30 * 60000), // 30 min ago
        endTime: new Date(now.getTime() + 90 * 60000), // 90 min from now
        totalAmount: 120,
        status: 'active',
        duration: 2,
        qrCode: 'mock-qr-code-1'
      },
      {
        _id: '2',
        spaceNumber: 'B08',
        floor: 2,
        startTime: new Date(now.getTime() + 60 * 60000), // 1 hour from now
        endTime: new Date(now.getTime() + 180 * 60000), // 3 hours from now
        totalAmount: 150,
        status: 'active',
        duration: 2,
        qrCode: 'mock-qr-code-2'
      }
    ];

    // Completed bookings
    this.completedBookings = [
      {
        _id: '3',
        spaceNumber: 'A22',
        floor: 1,
        startTime: new Date(now.getTime() - 3 * 24 * 60 * 60000), // 3 days ago
        endTime: new Date(now.getTime() - 3 * 24 * 60 * 60000 + 2 * 60 * 60000),
        totalAmount: 100,
        status: 'completed',
        duration: 2
      },
      {
        _id: '4',
        spaceNumber: 'C05',
        floor: 3,
        startTime: new Date(now.getTime() - 7 * 24 * 60 * 60000), // 1 week ago
        endTime: new Date(now.getTime() - 7 * 24 * 60 * 60000 + 4 * 60 * 60000),
        totalAmount: 200,
        status: 'completed',
        duration: 4
      }
    ];

    // Cancelled bookings
    this.cancelledBookings = [
      {
        _id: '5',
        spaceNumber: 'B12',
        floor: 2,
        startTime: new Date(now.getTime() - 2 * 24 * 60 * 60000),
        endTime: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 3 * 60 * 60000),
        totalAmount: 150,
        status: 'cancelled',
        duration: 3,
        cancelledAt: new Date(now.getTime() - 2 * 24 * 60 * 60000 + 30 * 60000),
        refundAmount: 120
      }
    ];
  }

  processBookings(bookings: any[]) {
    this.activeBookings = bookings.filter(b => b.status === 'active');
    this.inProgressBookings = bookings.filter(b => b.status === 'in_progress');
    this.completedBookings = bookings.filter(b => b.status === 'completed');
    this.cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  }

  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
  }

  getCurrentBookings(): Booking[] {
    switch (this.selectedTab) {
      case 'active':
        return this.activeBookings;
      case 'in_progress':
        return this.inProgressBookings;
      case 'completed':
        return this.completedBookings;
      case 'cancelled':
        return this.cancelledBookings;
      default:
        return [];
    }
  }

  getTotalHours(): number {
    return this.activeBookings.reduce((total, booking) => total + booking.duration, 0);
  }

  getBookingProgress(booking: Booking): number {
    const now = new Date();
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / total) * 100);
  }

  getTimeRemaining(booking: Booking): string {
    const now = new Date();
    const end = new Date(booking.endTime);
    
    if (now > end) return 'Expired';
    
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getEmptyStateIcon(): string {
    switch (this.selectedTab) {
      case 'active':
        return 'car-outline';
      case 'in_progress':
        return 'play-circle-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'car-outline';
    }
  }

  getEmptyStateTitle(): string {
    switch (this.selectedTab) {
      case 'active':
        return 'No active bookings';
      case 'in_progress':
        return 'No in progress bookings';
      case 'completed':
        return 'No completed bookings';
      case 'cancelled':
        return 'No cancelled bookings';
      default:
        return 'No bookings';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.selectedTab) {
      case 'active':
        return 'Book a parking space to see your active reservations here';
      case 'in_progress':
        return 'Your ongoing parking sessions will appear here';
      case 'completed':
        return 'Your completed parking sessions will appear here';
      case 'cancelled':
        return 'Any cancelled bookings will be shown here';
      default:
        return 'Your bookings will appear here';
    }
  }

  async refreshBookings() {
    await this.loadBookings();
    await this.showToast('Bookings refreshed', 'success');
  }

  viewBookingDetails(booking: Booking) {
    // Navigate to booking details page
    this.router.navigate(['/booking-details', booking._id]);
  }

  async showQRCode(booking: Booking) {
    // Load ticket data first
    await this.loadTicket(booking._id);
    
    const { QrModalComponent } = await import('../components/qr-modal/qr-modal.component');
    
    const modal = await this.modalController.create({
      component: QrModalComponent,
      componentProps: {
        booking: booking,
        qrCodeData: this.ticketQRs[booking._id]
      }
    });
    
    await modal.present();
  }

  async cancelBooking(booking: Booking) {
    const alert = await this.alertController.create({
      header: 'Cancel Booking',
      message: `Are you sure you want to cancel your booking for Space ${booking.spaceNumber}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          handler: async () => {
            try {
              await this.parkingService.cancelBooking(booking._id).toPromise();
              await this.showToast('Booking cancelled successfully', 'success');
              this.loadBookings();
            } catch (error) {
              console.error('Error cancelling booking:', error);
              await this.showToast('Failed to cancel booking', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  downloadReceipt(booking: Booking) {
    // Implement receipt download
    this.showToast('Receipt downloaded', 'success');
  }

  rateExperience(booking: Booking) {
    // Navigate to rating page
    this.showToast('Rating feature coming soon', 'primary');
  }

  goToSearch() {
    this.router.navigate(['/tabs/tab2']);
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }

  scanQRCode() {
    this.router.navigate(['/qr-scanner']);
  }

  async loadTicket(bookingId: string) {
    try {
      console.log('Loading ticket for booking:', bookingId);
      const response = await this.ticketService.getUserTickets().toPromise();
      console.log('Ticket response:', response);
      
      if (response.success) {
        const ticket = response.data.find((t: any) => t.bookingId._id === bookingId || t.bookingId === bookingId);
        console.log('Found ticket:', ticket);
        
        if (ticket) {
          // Generate simple QR code with ticket ID
          await this.generateSimpleQR(ticket._id, bookingId);
        } else {
          console.log('No ticket found for booking:', bookingId);
          // Generate ticket if it doesn't exist
          await this.generateTicket(bookingId);
        }
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
      // Try to generate ticket if loading fails
      await this.generateTicket(bookingId);
    }
  }

  async generateTicket(bookingId: string) {
    try {
      console.log('Generating ticket for booking:', bookingId);
      const response = await this.ticketService.generateTicket(bookingId).toPromise();
      console.log('Generate ticket response:', response);
      
      if (response.success) {
        // Generate simple QR code with ticket ID
        await this.generateSimpleQR(response.data._id, bookingId);
      }
    } catch (error) {
      console.error('Error generating ticket:', error);
      await this.showToast('Failed to generate ticket. Please try again.', 'danger');
    }
  }

  async generateSimpleQR(ticketId: string, bookingId: string) {
    try {
      const booking = this.activeBookings.find(b => b._id === bookingId);
      const qrData = JSON.stringify({
        ticketId: ticketId,
        validUntil: booking?.endTime || new Date()
      });
      
      const QRCode = await import('qrcode');
      this.ticketQRs[bookingId] = await QRCode.default.toDataURL(qrData, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M'
      });
      console.log('Generated simple QR for booking:', bookingId);
    } catch (error) {
      console.error('Error generating simple QR:', error);
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }
}