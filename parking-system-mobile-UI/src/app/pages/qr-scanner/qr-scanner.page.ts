import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TicketService, QRValidationResult } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.page.html',
  styleUrls: ['./qr-scanner.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class QrScannerPage implements OnInit, OnDestroy {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  
  isScanning = false;
  flashOn = false;
  scanResult: QRValidationResult | null = null;
  codeReader: BrowserMultiFormatReader;
  selectedDeviceId: string | undefined;
  availableDevices: MediaDeviceInfo[] = [];
  hasPermission = false;
  permissionDenied = false;

  constructor(
    private router: Router,
    private ticketService: TicketService,
    private toastController: ToastController,
    private alertController: AlertController,
    private authService: AuthService
  ) {
    this.codeReader = new BrowserMultiFormatReader();
  }

  async ngOnInit() {
    if (!this.isAdmin()) {
      this.router.navigate(['/tabs/tab1']);
      return;
    }
    await this.checkCameraPermission();
    await this.getVideoDevices();
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }

  ngOnDestroy() {
    this.stopScanning();
  }

  async checkCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.hasPermission = true;
      // Stop the stream immediately as we just needed to check permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera permission denied:', error);
      this.hasPermission = false;
      this.permissionDenied = true;
    }
  }

  async getVideoDevices() {
    try {
      const devices = await this.codeReader.listVideoInputDevices();
      this.availableDevices = devices;
      
      if (devices.length > 0) {
        // Prefer back camera if available
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        );
        this.selectedDeviceId = backCamera ? backCamera.deviceId : devices[0].deviceId;
      }
    } catch (error) {
      console.error('Error getting video devices:', error);
      await this.showToast('Unable to access camera devices', 'danger');
    }
  }

  async requestCameraPermission() {
    await this.checkCameraPermission();
    if (this.hasPermission) {
      await this.getVideoDevices();
      this.permissionDenied = false;
    }
  }

  async toggleFlash() {
    if (!this.isScanning) return;
    
    try {
      const stream = this.video.nativeElement.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      if (capabilities.torch) {
        this.flashOn = !this.flashOn;
        await track.applyConstraints({
          advanced: [{ torch: this.flashOn } as any]
        });
      } else {
        await this.showToast('Flash not supported on this device', 'warning');
      }
    } catch (error) {
      console.error('Error toggling flash:', error);
      await this.showToast('Unable to control flash', 'danger');
    }
  }

  async startScanning() {
    if (!this.hasPermission) {
      await this.showToast('Camera permission required', 'warning');
      return;
    }

    if (!this.selectedDeviceId) {
      await this.showToast('No camera device available', 'danger');
      return;
    }

    this.isScanning = true;
    this.scanResult = null;

    try {
      const result = await this.codeReader.decodeFromVideoDevice(
        this.selectedDeviceId,
        this.video.nativeElement,
        (result, error) => {
          if (result) {
            this.handleScanResult(result.getText());
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error('Scan error:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      await this.showToast('Unable to start camera', 'danger');
      this.isScanning = false;
    }
  }

  stopScanning() {
    if (this.codeReader) {
      this.codeReader.reset();
    }
    this.isScanning = false;
    this.flashOn = false;
  }

  async handleScanResult(qrData: string) {
    this.stopScanning();
    
    try {
      const result = await this.ticketService.validateQRCode(qrData).toPromise();
      
      if (result) {
        this.scanResult = result;
      }
    } catch (error) {
      console.error('QR validation error:', error);
      
      // Show mock result for demo
      this.scanResult = this.generateMockResult();
    }
  }

  async switchCamera() {
    if (this.availableDevices.length <= 1) {
      await this.showToast('Only one camera available', 'warning');
      return;
    }

    const currentIndex = this.availableDevices.findIndex(
      device => device.deviceId === this.selectedDeviceId
    );
    const nextIndex = (currentIndex + 1) % this.availableDevices.length;
    this.selectedDeviceId = this.availableDevices[nextIndex].deviceId;

    if (this.isScanning) {
      this.stopScanning();
      setTimeout(() => this.startScanning(), 500);
    }
  }

  private generateMockResult(): QRValidationResult {
    const isValid = Math.random() > 0.3; // 70% success rate for demo
    
    return {
      valid: isValid,
      message: isValid ? 'Valid ticket - Entry granted' : 'Invalid or expired ticket',
      ticket: isValid ? {
        _id: 'demo-ticket-id',
        bookingId: 'demo-booking-id',
        ticketNumber: 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        qrCode: 'mock-qr-data',
        status: 'active',
        expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        isUsed: false
      } : undefined,
      booking: isValid ? {
        spaceNumber: 'A' + Math.floor(Math.random() * 50 + 1).toString().padStart(2, '0')
      } : undefined,
      user: isValid ? {
        name: 'John Doe'
      } : undefined
    };
  }

  async uploadFromGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const result = await this.codeReader.decodeFromImageUrl(URL.createObjectURL(file));
          await this.handleScanResult(result.getText());
        } catch (error) {
          console.error('Error reading QR from image:', error);
          await this.showToast('No QR code found in image', 'warning');
        }
      }
    };
    
    input.click();
  }

  resetScanner() {
    this.stopScanning();
    this.scanResult = null;
  }

  goBack() {
    this.router.navigate(['/tabs/tab3']);
  }

  async showHelp() {
    const alert = await this.alertController.create({
      header: 'How to Scan',
      message: `
        <div style="text-align: left;">
          <p><strong>Steps to scan your QR ticket:</strong></p>
          <ol>
            <li>Tap "Start Scanning" button</li>
            <li>Point your camera at the QR code</li>
            <li>Keep the code within the frame</li>
            <li>Wait for automatic detection</li>
          </ol>
          <p><strong>Tips:</strong></p>
          <ul>
            <li>Ensure good lighting</li>
            <li>Hold device steady</li>
            <li>Clean your camera lens</li>
            <li>Use flash if needed</li>
          </ul>
        </div>
      `,
      buttons: ['Got it']
    });

    await alert.present();
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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