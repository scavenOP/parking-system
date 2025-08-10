import express from 'express';
import PaymentModel from '../Models/Payment-Model.js';
import BookingModel from '../Models/Booking-Model.js';
import { authenticateToken } from '../Middleware/auth.js';
import Razorpay from 'razorpay';

const router = express.Router();

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching payment history for user:', req.user?.userId);
        const userId = req.user?.userId; // From auth middleware
        const { period = '30' } = req.query;
        
        let dateFilter = {};
        if (period !== 'all') {
            const days = parseInt(period);
            const endDate = new Date(); // Current date
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0); // Start of day
            endDate.setHours(23, 59, 59, 999); // End of current day
            dateFilter = { 
                createdAt: { 
                    $gte: startDate,
                    $lte: endDate
                } 
            };
            console.log(`Payment history filter: ${startDate} to ${endDate}`);
        }
        
        const payments = await PaymentModel.find({
            userId: userId,
            ...dateFilter
        }).populate('bookingId').sort({ createdAt: -1 });
        
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
        
        // Create payment record
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        
        const payment = new PaymentModel({
            userId: req.user.userId,
            bookingId: bookingId,
            razorpayOrderId: razorpayOrder.id,
            amount: booking.totalAmount,
            status: 'pending',
            expiresAt: expiresAt
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