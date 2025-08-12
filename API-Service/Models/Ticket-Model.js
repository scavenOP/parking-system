import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  qrToken: {
    type: String,
    required: true
  },
  qrCodeData: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'cancelled'],
    default: 'active'
  },
  scannedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
ticketSchema.index({ qrToken: 1 }, { unique: true });
ticketSchema.index({ bookingId: 1 }, { unique: true });
ticketSchema.index({ expiresAt: 1 });

export default mongoose.model('Ticket', ticketSchema);