import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();
const connectionString = process.env.MONGODB_URL || "";
const client = new MongoClient(connectionString);
let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}
let db = conn.db("MoneyManagement");
export default db;