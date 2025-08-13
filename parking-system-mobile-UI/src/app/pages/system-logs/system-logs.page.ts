import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { LogDetailModalComponent } from '../../components/log-detail-modal/log-detail-modal.component';

@Component({
  selector: 'app-system-logs',
  templateUrl: './system-logs.page.html',
  styleUrls: ['./system-logs.page.scss'],
  standalone: false
})
export class SystemLogsPage implements OnInit {
  activeTab: 'website' | 'jobs' = 'website';
  logs: any[] = [];
  filteredLogs: any[] = [];
  isLoading = false;
  filterHours: number = 24;
  filterLevel: string = 'all';

  constructor(
    private http: HttpClient,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  switchTab(tab: any) {
    this.activeTab = tab as 'website' | 'jobs';
    this.loadLogs();
  }

  async loadLogs() {
    this.isLoading = true;
    try {
      const endpoint = this.activeTab === 'website' ? 
        `${environment.apiUrl}/api/admin/logs/website` : 
        `${environment.apiUrl}/api/admin/logs/jobs`;
      
      const response = await this.http.get<any>(endpoint).toPromise();
      
      if (response?.success) {
        this.logs = response.data || [];
        this.applyFilters();
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      this.logs = [];
      this.filteredLogs = [];
    }
    this.isLoading = false;
  }

  refreshLogs() {
    this.loadLogs();
  }

  applyFilters() {
    let filtered = [...this.logs];
    
    // Filter by hours
    if (this.filterHours > 0) {
      const now = new Date();
      const cutoffTime = new Date(now.getTime() - (this.filterHours * 60 * 60 * 1000));
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= cutoffTime;
      });
    }
    
    // Filter by level
    if (this.filterLevel !== 'all') {
      filtered = filtered.filter(log => 
        (log.level || 'info').toLowerCase() === this.filterLevel.toLowerCase()
      );
    }
    
    this.filteredLogs = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.filterHours = 0;
    this.filterLevel = 'all';
    this.applyFilters();
  }

  getLogClass(level: string): string {
    if (!level) return 'log-info';
    
    switch (level.toLowerCase()) {
      case 'error': return 'log-error';
      case 'warn': return 'log-warn';
      case 'info': return 'log-info';
      default: return 'log-info';
    }
  }

  getLevelColor(level: string): string {
    if (!level) return 'primary';
    
    switch (level.toLowerCase()) {
      case 'error': return 'danger';
      case 'warn': return 'warning';
      case 'info': return 'primary';
      default: return 'primary';
    }
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatDateTime(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  hasDetails(log: any): boolean {
    return !!(log.error || log.stack || this.hasExtraData(log));
  }

  hasExtraData(log: any): boolean {
    const excludeKeys = ['timestamp', 'level', 'message', 'error', 'stack'];
    return Object.keys(log).some(key => !excludeKeys.includes(key));
  }

  formatExtraData(log: any): string {
    const excludeKeys = ['timestamp', 'level', 'message', 'error', 'stack'];
    const extraData: any = {};
    
    Object.keys(log).forEach(key => {
      if (!excludeKeys.includes(key)) {
        extraData[key] = log[key];
      }
    });
    
    return JSON.stringify(extraData, null, 2);
  }

  async openLogModal(log: any) {
    const modal = await this.modalController.create({
      component: LogDetailModalComponent,
      componentProps: {
        log: log,
        formatDateTime: this.formatDateTime.bind(this),
        formatExtraData: this.formatExtraData.bind(this),
        hasExtraData: this.hasExtraData.bind(this)
      }
    });
    
    await modal.present();
  }

  trackByIndex(index: number): number {
    return index;
  }
}