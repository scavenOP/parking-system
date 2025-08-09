import express from 'express';
import ParkingService from '../Services/ParkingService.js';

const router = express.Router();

// Car Management Routes
router.post('/cars', async (req, res) => {
  try {
    // For now, get userId from request body (temporary solution)
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const car = await ParkingService.addCar(userId, req.body);
    res.status(201).json({ success: true, data: car });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/cars', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const cars = await ParkingService.getUserCars(userId);
    res.json({ success: true, data: cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/cars/available', async (req, res) => {
  try {
    const userId = req.query.userId;
    const { startTime, endTime } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const cars = await ParkingService.getAvailableCars(userId, new Date(startTime), new Date(endTime));
    res.json({ success: true, data: cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    await ParkingService.deleteCar(id, userId);
    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Parking Space Routes
router.get('/spaces/available', async (req, res) => {
  try {
    const { startTime, endTime, floor } = req.query;
    const spaces = await ParkingService.getAvailableSpaces(
      new Date(startTime), 
      new Date(endTime), 
      floor ? parseInt(floor) : null
    );
    res.json({ success: true, data: spaces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/spaces/initialize', async (req, res) => {
  try {
    await ParkingService.initializeParkingSpaces();
    res.json({ success: true, message: 'Parking spaces initialized' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Booking Routes
router.post('/bookings', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const booking = await ParkingService.createBooking(userId, req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const bookings = await ParkingService.getUserBookings(userId);
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test route to verify routing works
router.get('/bookings/:id/test', async (req, res) => {
  res.json({ success: true, message: 'Route is working', id: req.params.id });
});

router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId || req.query.userId;
    console.log('Cancel booking request - ID:', id, 'UserID:', userId);
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const booking = await ParkingService.cancelBooking(id, userId);
    res.json({ success: true, data: booking, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error.message);
    if (error.message.includes('not found')) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(400).json({ success: false, message: error.message });
    }
  }
});

router.post('/bookings/calculate-amount', async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Start time and end time are required' });
    }
    const amount = ParkingService.calculateBookingAmount(startTime, endTime);
    res.json({ success: true, data: { amount } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;