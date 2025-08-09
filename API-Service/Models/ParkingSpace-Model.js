import mongoose from 'mongoose';

const parkingSpaceSchema = new mongoose.Schema({
  spaceNumber: {
    type: String,
    required: true,
    unique: true
  },
  floor: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  position: {
    row: { type: Number, required: true, min: 1, max: 10 },
    column: { type: Number, required: true, min: 1, max: 5 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
parkingSpaceSchema.index({ floor: 1, isActive: 1 });
parkingSpaceSchema.index({ spaceNumber: 1 });

export default mongoose.model('ParkingSpace', parkingSpaceSchema);