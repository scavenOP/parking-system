import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>QR Ticket</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="qr-container">
        <h3>Space {{booking.spaceNumber}}</h3>
        <div class="qr-code-wrapper">
          @if (qrCodeDataURL) {
            <img [src]="qrCodeDataURL" alt="QR Code"/>
          }
        </div>
        <div class="ticket-info">
          <p><strong>Valid Until:</strong> {{formatTime(booking.endTime)}}</p>
          <p class="instruction">Show this QR code at the entrance</p>
          <div class="manual-code">
            <p class="manual-text">If unable to scan, use this code:</p>
            <p class="code-text">{{booking._id}}</p>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .qr-container {
      text-align: center;
    }
    .qr-code-wrapper {
      margin: 20px 0;
    }
    .qr-code-wrapper img {
      width: 200px;
      height: 200px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .ticket-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .instruction {
      color: #666;
      font-style: italic;
      margin-top: 10px;
    }
    .manual-code {
      margin-top: 15px;
      padding: 10px;
      background: #e3f2fd;
      border-radius: 6px;
      border-left: 4px solid #2196f3;
    }
    .manual-text {
      color: #666;
      font-size: 12px;
      margin: 0 0 5px 0;
    }
    .code-text {
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
      color: #1976d2;
      margin: 0;
      letter-spacing: 1px;
    }
  `]
})
export class QrModalComponent {
  @Input() booking: any;
  qrCodeDataURL: string = '';

  constructor(private modalController: ModalController) {}

  async ngOnInit() {
    await this.generateQRCode();
  }

  async generateQRCode() {
    try {
      const qrData = JSON.stringify({
        ticketId: this.booking._id,
        spaceNumber: this.booking.spaceNumber,
        validUntil: this.booking.endTime
      });
      
      this.qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}