import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Ticket from '../Models/Ticket-Model.js';
import Booking from '../Models/Booking-Model.js';

class TicketService {
  generateTicketNumber() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `PKG-${timestamp}-${random}`;
  }

  generateSecureToken(bookingId, userId) {
    const payload = {
      bookingId: bookingId.toString(),
      userId: userId.toString(),
      timestamp: Date.now(),
      random: crypto.randomBytes(8).toString('hex')
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '24h',
      issuer: 'parking-system',
      audience: 'ticket-scanner'
    });
  }

  async generateTicket(bookingId, userId) {
    // Check if booking exists and payment is completed
    const booking = await Booking.findOne({
      _id: bookingId,
      userId,
      status: 'active',
      paymentStatus: 'completed'
    }).populate('spaceId carId');

    if (!booking) {
      throw new Error('Valid booking not found or payment not completed');
    }

    // Check if ticket already exists
    const existingTicket = await Ticket.findOne({ bookingId });
    if (existingTicket) {
      return existingTicket;
    }

    const ticketNumber = this.generateTicketNumber();
    const qrToken = this.generateSecureToken(bookingId, userId);
    
    // Set expiry to booking start time + 1 hour grace period
    const expiresAt = new Date(booking.startTime.getTime() + 60 * 60 * 1000);

    // Generate QR code data URL
    const qrCodeData = await QRCode.toDataURL(qrToken, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    const ticket = new Ticket({
      bookingId,
      userId,
      ticketNumber,
      qrToken,
      qrCodeData,
      expiresAt
    });

    return await ticket.save();
  }

  async validateTicket(qrToken) {
    try {
      // Verify JWT token
      const decoded = jwt.verify(qrToken, process.env.JWT_SECRET, {
        issuer: 'parking-system',
        audience: 'ticket-scanner'
      });

      // Find ticket in database
      const ticket = await Ticket.findOne({ qrToken })
        .populate({
          path: 'bookingId',
          populate: [
            { path: 'spaceId', select: 'spaceNumber floor' },
            { path: 'carId', select: 'make model licensePlate' }
          ]
        })
        .populate('userId', 'Name Email');

      if (!ticket) {
        return { valid: false, message: 'Invalid ticket' };
      }

      // Check ticket status
      if (ticket.status !== 'active') {
        return { valid: false, message: `Ticket is ${ticket.status}` };
      }

      // Check if expired
      if (new Date() > ticket.expiresAt) {
        ticket.status = 'expired';
        await ticket.save();
        return { valid: false, message: 'Ticket has expired' };
      }

      // Check booking validity
      const booking = ticket.bookingId;
      if (booking.status !== 'active' || booking.paymentStatus !== 'completed') {
        return { valid: false, message: 'Booking is not valid' };
      }

      // Check if within valid time window (30 minutes before start time)
      const now = new Date();
      const startTime = new Date(booking.startTime);
      const validFromTime = new Date(startTime.getTime() - 30 * 60 * 1000);

      if (now < validFromTime) {
        return { 
          valid: false, 
          message: `Entry allowed from ${validFromTime.toLocaleTimeString()}` 
        };
      }

      // Mark ticket as used and update booking status
      ticket.status = 'used';
      ticket.scannedAt = now;
      await ticket.save();

      // Update booking status to in_progress
      booking.status = 'in_progress';
      await booking.save();

      return {
        valid: true,
        message: 'Access granted',
        data: {
          ticketNumber: ticket.ticketNumber,
          space: `${booking.spaceId.spaceNumber} (Floor ${booking.spaceId.floor})`,
          vehicle: `${booking.carId.make} ${booking.carId.model} - ${booking.carId.licensePlate}`,
          startTime: booking.startTime,
          endTime: booking.endTime,
          userName: ticket.userId.Name
        }
      };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { valid: false, message: 'Ticket has expired' };
      }
      if (error.name === 'JsonWebTokenError') {
        return { valid: false, message: 'Invalid ticket format' };
      }
      throw error;
    }
  }

  async getUserTickets(userId) {
    return await Ticket.find({ userId })
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'spaceId', select: 'spaceNumber floor' },
          { path: 'carId', select: 'make model licensePlate' }
        ]
      })
      .sort({ createdAt: -1 });
  }

  async cancelExpiredBookings() {
    const now = new Date();
    
    // Find bookings that started but user never scanned ticket
    const expiredBookings = await Booking.find({
      status: 'active',
      paymentStatus: 'completed',
      startTime: { $lt: now }
    });

    let cancelledCount = 0;

    for (const booking of expiredBookings) {
      const ticket = await Ticket.findOne({ bookingId: booking._id });
      
      // If no ticket was scanned and start time passed, cancel booking
      if (ticket && ticket.status === 'active') {
        booking.status = 'cancelled';
        await booking.save();
        
        ticket.status = 'cancelled';
        await ticket.save();
        
        cancelledCount++;
      }
    }

    return cancelledCount;
  }

  async completeExpiredBookings() {
    const now = new Date();
    
    // Find in_progress bookings that have ended
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

    return completedCount;
  }
}

export default new TicketService();