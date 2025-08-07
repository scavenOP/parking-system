
import express, { json } from 'express';
import UserRouter from './Routes/User-route.js';
import db from './db/conn.js'
const app = express();
const router = express.Router();
const PORT = process.env.PORT || 8000; 

app.use(express.json());
app.use("/", router);
app.use("/api/User", UserRouter);
// // Get a list of 50 posts
router.get("/transaction", async (req, res) => {
    let collection = await db.collection("spend_transaction");
    let results = await collection.find({})
      .limit(50)
      .toArray();
    res.send(results).status(200);
  });

  
app.listen(PORT, () => {
    console.log(`Server started at http:\\\\localhost:${PORT}`);
});