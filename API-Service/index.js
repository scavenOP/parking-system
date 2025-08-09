
import express, { json } from 'express';
import UserRouter from './Routes/User-route.js';
import db from './db/conn.js'
import path from 'path';
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 8000; 

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

// Serve static files from the Angular app
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public', 'browser')));



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

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});