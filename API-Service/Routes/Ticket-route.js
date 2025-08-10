import express from 'express';
import TicketService from '../Services/TicketService.js';

const router = express.Router();

// Get user tickets
router.get('/my-tickets', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const tickets = await TicketService.getUserTickets(userId);
    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Get tickets error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate ticket for booking
router.post('/generate', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.body.userId || req.query.userId;
    
    if (!userId || !bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Booking ID are required' 
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