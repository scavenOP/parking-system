
import express, { json } from 'express';
import UserRouter from './Routes/User-route.js';
import db from './db/conn.js'
import path from 'path';
import { websiteLogger } from './Services/Logger.js';
import fs from 'fs';
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 8000; 

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use("/", router);
app.use("/api/User", UserRouter);

// Import and use parking routes
import ParkingRouter from './Routes/Parking-route.js';
app.use("/api/parking", ParkingRouter);

// Import and use payment routes
import PaymentRouter from './Routes/Payment-route.js';
app.use("/api/payment", PaymentRouter);

// Import and use ticket routes
import TicketRouter from './Routes/Ticket-route.js';
app.use("/api/ticket", TicketRouter);

// Start scheduled jobs
import JobScheduler from './Services/JobScheduler.js';
JobScheduler.startScheduledJobs();

// Import and use admin routes
import AdminRouter from './Routes/Admin-route.js';
app.use("/api/admin", AdminRouter);

// Import and use statistics routes
import StatisticsRouter from './Routes/Statistics-route.js';
app.use("/api/statistics", StatisticsRouter);

// Serve static files from the Angular app
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public', 'browser'), {
  maxAge: '1d',
  etag: false
}));



// Health check endpoint
router.get("/api/health", (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// // Get a list of 50 posts
router.get("/transaction", async (req, res) => {
    let collection = await db.collection("spend_transaction");
    let results = await collection.find({})
      .limit(50)
      .toArray();
    res.send(results).status(200);
  });

  // Serve Angular app for all non-API routes
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'browser', 'index.html'));
  });

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

app.listen(PORT, () => {
    const message = `Server started at http://localhost:${PORT}`;
    console.log(message);
    websiteLogger.info(message);
});