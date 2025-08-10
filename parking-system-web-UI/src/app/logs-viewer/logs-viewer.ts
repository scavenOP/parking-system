import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-logs-viewer',
  imports: [CommonModule, FormsModule],
  templateUrl: './logs-viewer.html',
  styleUrl: './logs-viewer.scss'
})
export class LogsViewerComponent implements OnInit {
  activeTab: 'website' | 'jobs' = 'website';
  logs: any[] = [];
  filteredLogs: any[] = [];
  isLoading = false;
  selectedLog: any = null;
  filterHours: number = 24; // Default to last 24 hours
  filterLevel: string = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Default to last 24 hours
    this.filterHours = 24;
    this.loadLogs();
  }

  switchTab(tab: 'website' | 'jobs') {
    this.activeTab = tab;
    this.loadLogs();
  }

  async loadLogs() {
    this.isLoading = true;
    try {
      const endpoint = this.activeTab === 'website' ? '/api/admin/logs/website' : '/api/admin/logs/jobs';
      const response = await this.http.get<any>(endpoint).toPromise();
      
      if (response.success) {
        this.logs = response.data;
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

  getLogClass(level: string): string {
    if (!level) return 'log-info';
    
    switch (level.toLowerCase()) {
      case 'error': return 'log-error';
      case 'warn': return 'log-warn';
      case 'info': return 'log-info';
      default: return 'log-info';
    }
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatDateTime(timestamp: string): string {
    return new Date(timestamp).toLocaleString('en-IN', {
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

  openLogModal(log: any) {
    this.selectedLog = log;
  }

  closeModal() {
    this.selectedLog = null;
  }

  trackByIndex(index: number): number {
    return index;
  }

  applyFilters() {
    let filtered = [...this.logs];
    
    // Filter by hours from current time
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
    this.filterHours = 0; // Show all logs
    this.filterLevel = 'all';
    this.applyFilters();
  }

  setTimeFilter(hours: number) {
    this.filterHours = hours;
    this.applyFilters();
  }
}