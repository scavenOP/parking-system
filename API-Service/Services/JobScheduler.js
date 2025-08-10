import cron from 'node-cron';
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
          expiredTickets: await this.processExpiredTickets()
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
      
      // Cancel associated payment if exists
      await Payment.updateMany(
        { bookingId: booking._id },
        { status: 'expired' }
      );
      
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

  // Complete in_progress bookings that have reached end time
  async processCompletedBookings() {
    const now = new Date();
    
    const completedBookings = await Booking.find({
      status: 'in_progress',
      endTime: { $lt: now }
    });

    let completedCount = 0;
    
    for (const booking of completedBookings) {
      booking.status = 'completed';
      await booking.save();
      completedCount++;
    }

    if (completedCount > 0) {
      jobLogger.info(`✅ Completed ${completedCount} bookings that reached end time`);
    }
    
    return completedCount;
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

  // Manual cleanup method for admin use
  async runManualCleanup() {
    jobLogger.info('🧹 Running manual cleanup...');
    
    const results = {
      expiredHolds: await this.processExpiredPaymentHolds(),
      cancelledBookings: await this.processCancelledBookings(),
      completedBookings: await this.processCompletedBookings(),
      expiredTickets: await this.processExpiredTickets()
    };
    
    jobLogger.info('✅ Manual cleanup completed', results);
    return results;
  }
}

export default new JobScheduler();