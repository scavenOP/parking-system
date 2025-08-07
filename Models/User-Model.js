import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Email: { type: String, required: true },
    DateOfBirth: { type: Date, required: true },
    Address: { type: String, required: true },
    Password: { type: String, required: true }
});

const UserModel = mongoose.model('User', UserSchema, 'Users');
export default UserModel;