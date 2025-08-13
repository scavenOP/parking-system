import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-detail-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Log Details</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="log-details">
        <div class="detail-section">
          <h3>Time</h3>
          <p>{{formatDateTime(log.timestamp)}}</p>
        </div>
        
        <div class="detail-section">
          <h3>Level</h3>
          <ion-chip [color]="getLevelColor(log.level)">
            {{log.level?.toUpperCase() || 'INFO'}}
          </ion-chip>
        </div>
        
        <div class="detail-section">
          <h3>Message</h3>
          <p>{{log.message}}</p>
        </div>
        
        <div class="detail-section" *ngIf="log.error">
          <h3>Error</h3>
          <pre class="code-block">{{log.error}}</pre>
        </div>
        
        <div class="detail-section" *ngIf="log.stack">
          <h3>Stack Trace</h3>
          <pre class="code-block">{{log.stack}}</pre>
        </div>
        
        <div class="detail-section" *ngIf="hasExtraData(log)">
          <h3>Additional Data</h3>
          <pre class="code-block">{{formatExtraData(log)}}</pre>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .detail-section h3 {
      color: var(--ion-color-primary);
      margin: 0 0 8px 0;
      font-size: 1.1rem;
    }
    .detail-section p {
      color: var(--ion-color-dark);
      line-height: 1.5;
    }
    .code-block {
      background: var(--ion-color-light);
      padding: 12px;
      border-radius: 8px;
      font-size: 0.9rem;
      overflow-x: auto;
      white-space: pre-wrap;
      color: var(--ion-color-dark);
    }
  `]
})
export class LogDetailModalComponent {
  @Input() log: any;
  @Input() formatDateTime!: (timestamp: string) => string;
  @Input() formatExtraData!: (log: any) => string;
  @Input() hasExtraData!: (log: any) => boolean;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }

  getLevelColor(level: string): string {
    switch (level?.toLowerCase()) {
      case 'error': return 'danger';
      case 'warn': return 'warning';
      default: return 'primary';
    }
  }
}