import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PaymentModel from '../Models/Payment-Model.js';
import BookingModel from '../Models/Booking-Model.js';
import { authenticateToken } from '../Middleware/auth.js';
import Razorpay from 'razorpay';

dotenv.config();

const router = express.Router();

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_default',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'default_secret'
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching payment history for user:', req.user?.userId);
        console.log('User ID type:', typeof req.user?.userId);
        const userId = new mongoose.Types.ObjectId(req.user?.userId);
        console.log('Converted userId to ObjectId:', userId);
        const { period = '30' } = req.query;
        
        let dateFilter = {};
        if (period !== 'all') {
            const days = parseInt(period);
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0); // Start of day N days ago
            dateFilter = { 
                createdAt: { 
                    $gte: startDate,
                    $lte: endDate
                } 
            };
            console.log(`Payment history filter: ${startDate} to ${endDate}`);
        }
        
        // Debug: Get all payments first
        const allPayments = await PaymentModel.find({ userId }).sort({ createdAt: -1 });
        console.log('All payments for user:', allPayments.map(p => ({ id: p._id, userId: p.userId, createdAt: p.createdAt, amount: p.amount })));
        console.log('Total payments found:', allPayments.length);
        
        // Also try finding without userId filter to see all payments
        const allPaymentsInDB = await PaymentModel.find({}).sort({ createdAt: -1 }).limit(5);
        console.log('Recent payments in DB (any user):', allPaymentsInDB.map(p => ({ id: p._id, userId: p.userId, amount: p.amount })));
        
        const payments = await PaymentModel.find({
            userId: userId,
            ...dateFilter
        }).populate('bookingId').sort({ createdAt: -1 });
        
        console.log('Filtered payments:', payments.map(p => ({ id: p._id, createdAt: p.createdAt, amount: p.amount })));
        
        const formattedPayments = payments.map(payment => ({
            _id: payment._id,
            amount: payment.amount,
            status: payment.status,
            razorpayPaymentId: payment.razorpayPaymentId,
            createdAt: payment.createdAt,
            bookingId: payment.bookingId?._id,
            space: payment.bookingId?.space
        }));
        
        res.json({
            success: true,
            data: formattedPayments
        });
        
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history'
        });
    }
});

// Create payment order
router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        const { bookingId } = req.body;
        console.log('Creating payment order for booking:', bookingId);
        
        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: booking.totalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `booking_${bookingId}`,
            payment_capture: 1
        });
        
        // Create payment record (no expiry - payments are preserved permanently)
        const payment = new PaymentModel({
            userId: req.user.userId,
            bookingId: bookingId,
            razorpayOrderId: razorpayOrder.id,
            amount: booking.totalAmount,
            status: 'pending'
        });
        
        await payment.save();
        
        res.json({
            success: true,
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
        
    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order' });
    }
});

// Verify payment
router.post('/verify', authenticateToken, async (req, res) => {
    try {
        console.log('Payment verification request body:', req.body);
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
        
        const payment = await PaymentModel.findOne({ razorpayOrderId: razorpay_order_id });
        console.log('Found payment:', payment);
        
        if (!payment) {
            const allPayments = await PaymentModel.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(5);
            console.log('Recent payments for user:', allPayments);
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        
        // Update payment status
        payment.status = 'completed';
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        await payment.save();
        
        // Update booking status
        await BookingModel.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: 'completed',
            status: 'active'
        });
        
        res.json({ success: true, message: 'Payment verified successfully' });
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
});

// Handle payment failure
router.post('/failure', authenticateToken, async (req, res) => {
    try {
        const { orderId, reason } = req.body;
        console.log('Handling payment failure:', { orderId, reason });
        
        const payment = await PaymentModel.findOne({ razorpayOrderId: orderId });
        if (payment) {
            payment.status = 'failed';
            payment.failureReason = reason;
            await payment.save();
        }
        
        res.json({ success: true, message: 'Payment failure recorded' });
        
    } catch (error) {
        console.error('Error handling payment failure:', error);
        res.status(500).json({ success: false, message: 'Failed to handle payment failure' });
    }
});

export default router;