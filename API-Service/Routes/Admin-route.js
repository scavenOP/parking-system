import express from 'express';
import JobScheduler from '../Services/JobScheduler.js';
import fs from 'fs';
import path from 'path';
import { websiteLogger } from '../Services/Logger.js';

const router = express.Router();

// Manual cleanup endpoint
router.post('/cleanup', async (req, res) => {
  try {
    const results = await JobScheduler.runManualCleanup();
    res.json({ 
      success: true, 
      message: 'Manual cleanup completed',
      data: results
    });
  } catch (error) {
    console.error('Admin cleanup error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get job status
router.get('/job-status', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Scheduled jobs are running',
    data: {
      interval: 'Every minute',
      jobs: [
        'Process expired payment holds (5 min)',
        'Cancel unscanned bookings past start time',
        'Complete in_progress bookings past end time',
        'Expire tickets past expiry time'
      ]
    }
  });
});

// Get website logs
router.get('/logs/website', (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'logs', 'website.log');
    
    if (!fs.existsSync(logPath)) {
      return res.json({ success: true, data: [] });
    }
    
    const logContent = fs.readFileSync(logPath, 'utf8');
    const logs = logContent.split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, timestamp: new Date().toISOString() };
        }
      })
      .slice(-100); // Last 100 entries
    
    res.json({ success: true, data: logs.reverse() });
  } catch (error) {
    websiteLogger.error('Error reading website logs', { error: error.message });
    res.status(500).json({ success: false, message: 'Error reading logs' });
  }
});

// Get job logs
router.get('/logs/jobs', (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'logs', 'jobs.log');
    
    if (!fs.existsSync(logPath)) {
      return res.json({ success: true, data: [] });
    }
    
    const logContent = fs.readFileSync(logPath, 'utf8');
    const logs = logContent.split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, timestamp: new Date().toISOString() };
        }
      })
      .slice(-100); // Last 100 entries
    
    res.json({ success: true, data: logs.reverse() });
  } catch (error) {
    websiteLogger.error('Error reading job logs', { error: error.message });
    res.status(500).json({ success: false, message: 'Error reading logs' });
  }
});

export default router;