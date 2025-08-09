import Car from '../Models/Car-Model.js';
import ParkingSpace from '../Models/ParkingSpace-Model.js';
import Booking from '../Models/Booking-Model.js';

class ParkingService {
  // Car Management
  async addCar(userId, carData) {
    const userCarsCount = await Car.countDocuments({ userId, isActive: true });
    if (userCarsCount >= 5) {
      throw new Error('Maximum 5 cars allowed per user');
    }

    const car = new Car({ ...carData, userId });
    return await car.save();
  }

  async getUserCars(userId) {
    return await Car.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  async deleteCar(carId, userId) {
    const car = await Car.findOne({ _id: carId, userId });
    if (!car) {
      throw new Error('Car not found or unauthorized');
    }
    
    // Soft delete by setting isActive to false
    car.isActive = false;
    return await car.save();
  }

  async getAvailableCars(userId, startTime, endTime) {
    const bookedCarIds = await Booking.find({
      userId,
      status: 'active',
      $or: [
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } }
      ]
    }).distinct('carId');

    return await Car.find({
      userId,
      isActive: true,
      _id: { $nin: bookedCarIds }
    });
  }

  // Parking Space Management
  async initializeParkingSpaces() {
    const existingSpaces = await ParkingSpace.countDocuments();
    if (existingSpaces > 0) return;

    const spaces = [];
    for (let floor = 1; floor <= 3; floor++) {
      for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 5; col++) {
          spaces.push({
            spaceNumber: `${floor}${row.toString().padStart(2, '0')}${col}`,
            floor,
            position: { row, column: col }
          });
        }
      }
    }

    await ParkingSpace.insertMany(spaces);
  }

  async getAvailableSpaces(startTime, endTime, floor = null) {
    const bookedSpaceIds = await Booking.find({
      status: 'active',
      $or: [
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } }
      ]
    }).distinct('spaceId');

    const query = {
      isActive: true,
      _id: { $nin: bookedSpaceIds }
    };

    if (floor) query.floor = floor;

    return await ParkingSpace.find(query).sort({ floor: 1, 'position.row': 1, 'position.column': 1 });
  }

  // Calculate booking amount (server-side for security)
  calculateBookingAmount(startTime, endTime) {
    const hours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
    const firstHourRate = parseInt(process.env.FIRST_HOUR_RATE) || 50;
    const additionalHourRate = parseInt(process.env.ADDITIONAL_HOUR_RATE) || 60;
    
    if (hours <= 1) {
      return firstHourRate;
    } else {
      return firstHourRate + ((hours - 1) * additionalHourRate);
    }
  }

  // Booking Management
  async createBooking(userId, bookingData) {
    const { carId, spaceId, startTime, endTime } = bookingData;

    // Check if space is available
    const conflictingBooking = await Booking.findOne({
      spaceId,
      status: 'active',
      $or: [
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } }
      ]
    });

    if (conflictingBooking) {
      throw new Error('Parking space is not available for the selected time');
    }

    // Calculate total amount on server side for security
    const totalAmount = this.calculateBookingAmount(startTime, endTime);

    const booking = new Booking({
      userId,
      carId,
      spaceId,
      startTime,
      endTime,
      totalAmount
    });

    return await booking.save();
  }

  async getUserBookings(userId) {
    return await Booking.find({ userId })
      .populate('carId', 'make model licensePlate')
      .populate('spaceId', 'spaceNumber floor')
      .sort({ createdAt: -1 });
  }

  async cancelBooking(bookingId, userId) {
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      throw new Error('Booking not found or unauthorized');
    }
    
    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }
    
    booking.status = 'cancelled';
    return await booking.save();
  }
}

export default new ParkingService();