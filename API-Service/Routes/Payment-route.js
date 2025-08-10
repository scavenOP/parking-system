import express from 'express';
import PaymentService from '../Services/PaymentService.js';

const router = express.Router();

// Create payment order
router.post('/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.body.userId || req.query.userId;
    
    if (!userId || !bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Booking ID are required' 
      });
    }

    const orderData = await PaymentService.createPaymentOrder(bookingId, userId);
    res.json({ success: true, data: orderData });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const result = await PaymentService.verifyPayment(req.body);
    res.json({ 
      success: true, 
      data: result, 
      message: 'Payment verified successfully' 
    });
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Handle payment failure
router.post('/failure', async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    await PaymentService.handlePaymentFailure(orderId, reason);
    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (error) {
    console.error('Payment failure error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get user payment history
router.get('/history', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const payments = await PaymentService.getUserPayments(userId);
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Payment history error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const payment = await PaymentService.getPaymentDetails(id, userId);
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Payment details error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;