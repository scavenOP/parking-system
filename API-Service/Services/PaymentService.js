import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../Models/Payment-Model.js';
import Booking from '../Models/Booking-Model.js';
import TicketService from './TicketService.js';

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  async createPaymentOrder(bookingId, userId) {
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      throw new Error('Booking not found');
    }

    const options = {
      amount: booking.totalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: userId.toString()
      }
    };

    const order = await this.razorpay.orders.create(options);
    
    // Set payment hold expiry (5 minutes from now)
    const holdExpiry = new Date(Date.now() + 5 * 60 * 1000);
    
    // Update booking status
    booking.status = 'pending_payment';
    booking.paymentHoldExpiry = holdExpiry;
    await booking.save();

    // Create payment record
    const payment = new Payment({
      userId,
      bookingId,
      razorpayOrderId: order.id,
      amount: booking.totalAmount,
      expiresAt: holdExpiry
    });
    await payment.save();

    return {
      orderId: order.id,
      amount: booking.totalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      payment: payment
    };
  }

  async verifyPayment(paymentData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Payment verification failed');
    }

    // Update payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      throw new Error('Payment record not found');
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'completed';
    await payment.save();

    // Update booking status
    const booking = await Booking.findById(payment.bookingId);
    booking.status = 'active';
    booking.paymentStatus = 'completed';
    booking.paymentHoldExpiry = null;
    await booking.save();

    // Generate ticket after successful payment
    const ticket = await TicketService.generateTicket(booking._id, booking.userId);

    return { payment, booking, ticket };
  }

  async handlePaymentFailure(orderId, reason) {
    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (payment) {
      payment.status = 'failed';
      payment.failureReason = reason;
      await payment.save();

      // Update booking status but keep the 5-minute hold
      const booking = await Booking.findById(payment.bookingId);
      booking.paymentStatus = 'failed';
      booking.status = 'pending_payment'; // Keep booking in pending state for retry
      // paymentHoldExpiry remains set for 5-minute window
      await booking.save();
    }
  }

  async getUserPayments(userId) {
    return await Payment.find({ userId })
      .populate('bookingId', 'startTime endTime totalAmount')
      .sort({ createdAt: -1 });
  }

  // Cleanup expired bookings (called periodically)
  async cleanupExpiredBookings() {
    const now = new Date();
    const expiredBookings = await Booking.find({
      status: 'pending_payment',
      paymentHoldExpiry: { $lt: now }
    });

    for (const booking of expiredBookings) {
      booking.status = 'cancelled';
      booking.paymentStatus = 'expired';
      await booking.save();
    }

    return expiredBookings.length;
  }

  async getPaymentDetails(paymentId, userId) {
    return await Payment.findOne({ _id: paymentId, userId })
      .populate('bookingId')
      .populate('userId', 'Name Email');
  }
}

export default new PaymentService();