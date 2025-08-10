import express from 'express';
import TicketService from '../Services/TicketService.js';
import { authenticateToken } from '../Middleware/auth.js';

const router = express.Router();

// Get user tickets
router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Getting tickets for user:', userId);

    const tickets = await TicketService.getUserTickets(userId);
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Get tickets error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate ticket for booking
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.userId;
    
    console.log('Generating ticket for booking:', bookingId, 'user:', userId);
    
    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking ID is required' 
      });
    }

    const ticket = await TicketService.generateTicket(bookingId, userId);
    res.json({ 
      success: true, 
      data: ticket, 
      message: 'Ticket generated successfully' 
    });
  } catch (error) {
    console.error('Generate ticket error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Validate ticket (for scanner)
router.post('/validate', async (req, res) => {
  try {
    const { qrToken } = req.body;
    
    if (!qrToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR token is required' 
      });
    }

    const result = await TicketService.validateTicket(qrToken);
    
    if (result.valid) {
      res.json({ 
        success: true, 
        valid: true,
        message: result.message,
        data: result.data 
      });
    } else {
      res.json({ 
        success: true, 
        valid: false,
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Validate ticket error:', error.message);
    res.status(500).json({ success: false, message: 'Validation failed' });
  }
});

// Manual cleanup (admin endpoint)
router.post('/cleanup-expired', async (req, res) => {
  try {
    const JobScheduler = (await import('../Services/JobScheduler.js')).default;
    const results = await JobScheduler.runManualCleanup();
    
    res.json({ 
      success: true, 
      message: 'Manual cleanup completed',
      data: results
    });
  } catch (error) {
    console.error('Cleanup error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;