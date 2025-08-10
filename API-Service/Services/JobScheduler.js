import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import Booking from '../Models/Booking-Model.js';
import Payment from '../Models/Payment-Model.js';
import Ticket from '../Models/Ticket-Model.js';
import { jobLogger } from './Logger.js';

class JobScheduler {
  
  // Run every minute to check various conditions
  startScheduledJobs() {
    jobLogger.info('🕐 Starting scheduled jobs...');
    
    // Run every minute
    cron.schedule('* * * * *', async () => {
      try {
        const results = {
          expiredHolds: await this.processExpiredPaymentHolds(),
          cancelledBookings: await this.processCancelledBookings(),
          completedBookings: await this.processCompletedBookings(),
          expiredTickets: await this.processExpiredTickets(),
          cleanedLogs: await this.cleanupOldLogs()
        };
        
        // Log only if there were changes
        const totalChanges = Object.values(results).reduce((sum, count) => sum + count, 0);
        if (totalChanges > 0) {
          jobLogger.info('Scheduled job completed', results);
        }
      } catch (error) {
        jobLogger.error('Scheduled job error', { error: error.message, stack: error.stack });
      }
    });
    
    jobLogger.info('✅ Scheduled jobs started successfully');
  }

  // Cancel bookings with expired payment holds (5 minutes)
  async processExpiredPaymentHolds() {
    const now = new Date();
    
    const expiredHolds = await Booking.find({
      status: 'pending_payment',
      paymentHoldExpiry: { $lt: now }
    });

    let cancelledCount = 0;
    
    for (const booking of expiredHolds) {
      booking.status = 'cancelled';
      booking.paymentStatus = 'expired';
      await booking.save();
      
      // Keep payment records intact - no payment status changes
      
      cancelledCount++;
    }

    if (cancelledCount > 0) {
      jobLogger.info(`⏰ Cancelled ${cancelledCount} bookings with expired payment holds`);
    }
    
    return cancelledCount;
  }

  // Cancel active bookings that were never scanned after start time
  async processCancelledBookings() {
    const now = new Date();
    
    const unscannedBookings = await Booking.find({
      status: 'active',
      paymentStatus: 'completed',
      startTime: { $lt: now }
    });

    let cancelledCount = 0;
    
    for (const booking of unscannedBookings) {
      const ticket = await Ticket.findOne({ bookingId: booking._id });
      
      // If ticket exists but was never scanned, cancel booking
      if (ticket && ticket.status === 'active') {
        booking.status = 'cancelled';
        await booking.save();
        
        ticket.status = 'cancelled';
        await ticket.save();
        
        cancelledCount++;
      }
    }

    if (cancelledCount > 0) {
      jobLogger.info(`🚫 Cancelled ${cancelledCount} unscanned bookings past start time`);
    }
    
    return cancelledCount;
  }

  // Process bookings that have reached end time
  async processCompletedBookings() {
    const now = new Date();
    
    // Find active or in_progress bookings past end time
    const expiredBookings = await Booking.find({
      status: { $in: ['active', 'in_progress'] },
      paymentStatus: 'completed',
      endTime: { $lt: now }
    });

    let completedCount = 0;
    let expiredCount = 0;
    
    for (const booking of expiredBookings) {
      const ticket = await Ticket.findOne({ bookingId: booking._id });
      
      if (ticket && ticket.status === 'used') {
        // User scanned ticket - mark as completed
        booking.status = 'completed';
        await booking.save();
        completedCount++;
      } else {
        // User didn't scan ticket - mark as expired
        booking.status = 'expired';
        await booking.save();
        
        if (ticket) {
          ticket.status = 'expired';
          await ticket.save();
        }
        expiredCount++;
      }
    }

    if (completedCount > 0 || expiredCount > 0) {
      jobLogger.info(`✅ Completed ${completedCount} scanned bookings, expired ${expiredCount} unscanned bookings`);
    }
    
    return completedCount + expiredCount;
  }

  // Mark expired tickets as expired
  async processExpiredTickets() {
    const now = new Date();
    
    const expiredTickets = await Ticket.find({
      status: 'active',
      expiresAt: { $lt: now }
    });

    let expiredCount = 0;
    
    for (const ticket of expiredTickets) {
      ticket.status = 'expired';
      await ticket.save();
      expiredCount++;
    }

    if (expiredCount > 0) {
      jobLogger.info(`⏳ Expired ${expiredCount} tickets past expiry time`);
    }
    
    return expiredCount;
  }

  // Clean up log files older than 7 days
  async cleanupOldLogs() {
    const logsDir = path.join(process.cwd(), 'logs');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let cleanedCount = 0;
    
    try {
      if (!fs.existsSync(logsDir)) {
        return cleanedCount;
      }
      
      const files = fs.readdirSync(logsDir);
      
      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < sevenDaysAgo) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        jobLogger.info(`🗑️ Cleaned up ${cleanedCount} old log files`);
      }
    } catch (error) {
      jobLogger.error('Error cleaning up logs:', error);
    }
    
    return cleanedCount;
  }

  // Manual cleanup method for admin use
  async runManualCleanup() {
    jobLogger.info('🧹 Running manual cleanup...');
    
    const results = {
      expiredHolds: await this.processExpiredPaymentHolds(),
      cancelledBookings: await this.processCancelledBookings(),
      completedBookings: await this.processCompletedBookings(),
      expiredTickets: await this.processExpiredTickets(),
      cleanedLogs: await this.cleanupOldLogs()
    };
    
    jobLogger.info('✅ Manual cleanup completed', results);
    return results;
  }
}

export default new JobScheduler();