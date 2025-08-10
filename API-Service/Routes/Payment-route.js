import express from 'express';
import PaymentModel from '../Models/Payment-Model.js';
import BookingModel from '../Models/Booking-Model.js';

const router = express.Router();

// Get payment history
router.get('/history', async (req, res) => {
    try {
        const userId = req.user?.userId; // From auth middleware
        const { period = '30' } = req.query;
        
        let dateFilter = {};
        if (period !== 'all') {
            const days = parseInt(period);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            dateFilter = { createdAt: { $gte: startDate } };
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

export default router;