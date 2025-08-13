import express from 'express';
import mongoose from 'mongoose';
import BookingModel from '../Models/Booking-Model.js';
import PaymentModel from '../Models/Payment-Model.js';
import UserModel from '../Models/User-Model.js';
import CarModel from '../Models/Car-Model.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

// Get user parking statistics
router.get('/user-stats', authenticateToken, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId);
        
        // Get user bookings
        const bookings = await BookingModel.find({ userId });
        const payments = await PaymentModel.find({ userId });
        const cars = await CarModel.find({ userId });
        
        const stats = {
            totalBookings: bookings.length,
            activeBookings: bookings.filter(b => b.status === 'active').length,
            completedBookings: bookings.filter(b => b.status === 'completed').length,
            cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
            totalCars: cars.length,
            totalSpent: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
            totalHours: bookings.filter(b => b.status === 'completed').reduce((sum, b) => {
                const hours = Math.ceil((new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60 * 60));
                return sum + hours;
            }, 0)
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
});

// Get admin dashboard statistics
router.get('/admin-stats', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        const user = await UserModel.findById(req.user.userId);
        if (user.Role !== 'Admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        
        const totalUsers = await UserModel.countDocuments();
        const totalBookings = await BookingModel.countDocuments();
        const totalPayments = await PaymentModel.countDocuments({ status: 'completed' });
        const totalRevenue = await PaymentModel.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const activeBookings = await BookingModel.countDocuments({ status: 'active' });
        const todayBookings = await BookingModel.countDocuments({
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });
        
        const stats = {
            totalUsers,
            totalBookings,
            activeBookings,
            todayBookings,
            totalPayments,
            totalRevenue: totalRevenue[0]?.total || 0,
            occupancyRate: Math.round((activeBookings / 150) * 100) // 150 total spaces
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin statistics' });
    }
});

export default router;