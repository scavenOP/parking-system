import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpace',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending_payment', 'active', 'in_progress', 'completed', 'cancelled', 'payment_failed'],
    default: 'pending_payment'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  paymentHoldExpiry: {
    type: Date,
    default: null
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ spaceId: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ carId: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);