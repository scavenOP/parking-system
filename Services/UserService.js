import UserModel from '../Models/User-Model.js';
import RoleModel from '../Models/Role-Model.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config(); // Load environment variables

export async function getUserById(userId) {
    const user = await UserModel.findById(userId).populate('Role');;

    // Create a VM object with UserId and other details
        const userVM = {
            UserId: user._id,
            Name: user.Name,
            Email: user.Email,
            DateOfBirth: user.DateOfBirth,
            Address: user.Address,
            Role: user.Role ? user.Role.RoleName : null,
            // Do not send password for security
        };
    return userVM;
}

export async function createRole(roleName, description) {
    const role = new RoleModel({ RoleName: roleName, Description: description });
    return await role.save();
}

export async function createUser(userData) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10); // Fetch saltRounds from .env
    const hashedPassword = await bcrypt.hash(userData.Password, saltRounds);

    // Replace the plain password with the hashed password
    userData.Password = hashedPassword;

    // Fetch the default role (e.g., "User") from the Roles collection
    const defaultRole = await RoleModel.findOne({ RoleName: 'User' });
    if (!defaultRole) {
        throw new Error('Default role "User" not found in the database');
    }

    // Assign the default role to the user
    userData.Role = defaultRole._id;

    const newUser = new UserModel(userData);
    return await newUser.save();
}

export async function loginUser(username, password) {
    // Find the user by username or email
    const user = await UserModel.findOne({
        $or: [{ Username: username }, { Email: username }],
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }

    // Generate a JWT token
    const token = jwt.sign(
        { userId: user._id, role: user.Role }, // Payload
        process.env.JWT_SECRET, // Secret key from .env
        { expiresIn: '1h' } // Token expiration time
    );

    // Return user details (excluding the password for security)
    return {
        UserId: user._id,
        Name: user.Name,
        Email: user.Email,
        DateOfBirth: user.DateOfBirth,
        Address: user.Address,
        Role: user.Role,
        Token: token,
    };
}