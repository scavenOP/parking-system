import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
    RoleName: { type: String, required: true, unique: true }, // e.g., 'Admin', 'User', etc.
    Description: { type: String }, // Optional description of the role
});

const RoleModel = mongoose.model('Role', RoleSchema, 'Roles');
export default RoleModel;