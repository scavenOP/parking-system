import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.MONGODB_URL || "";

mongoose.connect(connectionString, {
    dbName: 'MoneyManagement'
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB via Mongoose');
});

export default db;