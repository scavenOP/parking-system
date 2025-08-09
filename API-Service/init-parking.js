import ParkingService from './Services/ParkingService.js';
import db from './db/conn.js';

async function initializeParkingSystem() {
  try {
    console.log('Initializing parking system...');
    
    // Initialize parking spaces
    await ParkingService.initializeParkingSpaces();
    console.log('✅ Parking spaces initialized successfully');
    
    console.log('🎉 Parking system initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing parking system:', error);
    process.exit(1);
  }
}

initializeParkingSystem();