import db from "../db/conn";
import { User } from "../Models/User";


let userCollection = await db.collection("user");
export default class UserRepository {
    
    public async registeruser(user : User){
        // const doc = { name: "", shape: "round" };
        const result = await userCollection.insertOne(user);
    }
}