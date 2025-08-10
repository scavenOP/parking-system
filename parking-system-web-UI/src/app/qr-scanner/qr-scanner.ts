import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../services/ticket.service';
import { trigger, transition, style, animate } from '@angular/animations';
import QrScanner from 'qr-scanner';

@Component({
  selector: 'app-qr-scanner',
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.scss',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class QrScannerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  
  scannerEnabled = true;
  errorMessage = '';
  isValidating = false;
  scanResult: any = null;
  resultClass = '';
  qrScanner: any = null;
  manualInput = '';

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    // Delay camera loading to ensure DOM is ready
    setTimeout(() => {
      this.loadCamera();
    }, 500);
  }

  ngOnDestroy() {
    if (this.qrScanner) {
      this.qrScanner.stop();
      this.qrScanner.destroy();
    }
  }

  async loadCamera() {
    try {
      console.log('Loading camera...');
      
      if (!this.videoElement) {
        console.error('Video element not found');
        this.errorMessage = 'Video element not ready. Please refresh.';
        return;
      }

      console.log('Video element found, creating QR scanner...');
      
      this.qrScanner = new QrScanner(
        this.videoElement.nativeElement,
        (result: any) => {
          console.log('QR detected:', result);
          this.onQrDetected(result.data || result);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      );
      
      console.log('Starting QR scanner...');
      await this.qrScanner.start();
      
      this.errorMessage = '';
      console.log('QR Scanner started successfully');
      
    } catch (error) {
      console.error('QR Scanner error:', error);
      this.errorMessage = `Camera error: ${(error as any).message || 'Access denied'}. Use manual input below.`;
    }
  }

  onQrDetected(qrData: string) {
    console.log('QR Code detected:', qrData);
    if (!this.isValidating) {
      this.validateTicket(qrData);
    }
  }

  validateManualInput() {
    if (this.manualInput.trim()) {
      this.validateTicket(this.manualInput.trim());
    }
  }

  retryCamera() {
    this.errorMessage = '';
    if (this.qrScanner) {
      this.qrScanner.stop();
    }
    this.loadCamera();
  }



  onScanSuccess(result: string) {
    console.log('QR Code detected:', result);
    if (this.isValidating) return;
    
    this.scannerEnabled = false;
    this.isValidating = true;
    this.validateTicket(result);
  }

  onScanError(error: any) {
    console.error('Scan error:', error);
    // Don't show errors for normal scanning attempts
  }

  async validateTicket(qrToken: string) {
    // Start loading
    this.isValidating = true;
    this.scanResult = null;
    
    console.log('Validating QR token:', qrToken);
    
    try {
      const response = await this.ticketService.validateTicket(qrToken).toPromise();
      console.log('Validation response:', response);
      
      // Stop loading
      this.isValidating = false;
      
      if (response && response.success) {
        this.scanResult = {
          valid: response.valid,
          message: response.message,
          data: response.data
        };
        this.resultClass = response.valid ? 'success' : 'error';
      } else {
        this.scanResult = {
          valid: false,
          message: response?.message || 'Validation failed'
        };
        this.resultClass = 'error';
      }
    } catch (error) {
      console.error('Validation error:', error);
      
      // Stop loading
      this.isValidating = false;
      
      this.scanResult = {
        valid: false,
        message: 'Network error. Please try again.'
      };
      this.resultClass = 'error';
    }
  }

  closePopup() {
    this.scanResult = null;
    this.resultClass = '';
    this.manualInput = '';
    this.isValidating = false;
  }

  resetScanner() {
    this.scanResult = null;
    this.resultClass = '';
    this.manualInput = '';
    this.scannerEnabled = true;
    this.isValidating = false;
  }

  formatDateTime(dateTime: Date | string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}