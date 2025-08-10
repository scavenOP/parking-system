import express from 'express';
import UserModel from '../Models/User-Model.js';
import UserSettingsModel from '../Models/UserSettings-Model.js';
import bcrypt from 'bcrypt';
import { getUserById, createUser, loginUser } from '../Services/UserService.js';
import { authenticateToken } from '../Middleware/auth.js';
const router = express.Router();

// Example: Get all users
router.get('/', async (req, res) => {
    try {
        // Replace with your database logic
        res.status(200).send({ message: 'Get all users' });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



// Example: Create a new user
router.post('/', async (req, res) => {
    try {
        // List required fields as per your UserModel
        const requiredFields = ['Name', 'Email', 'DateOfBirth', 'Address', 'Password'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).send({ error: `Missing fields: ${missingFields.join(', ')}` });
        }

        // Pass req.body directly to UserModel, let Mongoose handle _id
         const newUser = await createUser(req.body);

        res.status(201).send({ message: 'User created', data: newUser });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get user profile with settings
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        
        const user = await UserModel.findById(userId).select('-Password');
        const settings = await UserSettingsModel.findOne({ userId }) || {
            notifications: { email: true, sms: false, reminders: true },
            preferences: { defaultLocation: '', paymentMethod: 'card', autoExtend: false },
            phone: ''
        };
        
        const profileData = {
            ...user.toObject(),
            phone: settings.phone || '',
            notifications: settings.notifications || { email: true, sms: false, reminders: true },
            preferences: settings.preferences || { defaultLocation: '', paymentMethod: 'card', autoExtend: false }
        };
        
        res.json({ success: true, data: profileData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, phone, address } = req.body;
        
        await UserModel.findByIdAndUpdate(userId, {
            Name: name,
            Address: address
        });
        
        await UserSettingsModel.findOneAndUpdate(
            { userId },
            { phone },
            { upsert: true }
        );
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// Update notifications
router.put('/notifications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        
        await UserSettingsModel.findOneAndUpdate(
            { userId },
            { notifications: req.body },
            { upsert: true }
        );
        
        res.json({ success: true, message: 'Notifications updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
});

// Update preferences
router.put('/preferences', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        
        await UserSettingsModel.findOneAndUpdate(
            { userId },
            { preferences: req.body },
            { upsert: true }
        );
        
        res.json({ success: true, message: 'Preferences updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update preferences' });
    }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            throw new Error('Current and new passwords are required');
        }
        
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }
        
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        const isValid = await bcrypt.compare(currentPassword, user.Password);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }
        
        const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await UserModel.findByIdAndUpdate(userId, { Password: hashedPassword });
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to change password' });
    }
});

// Delete account
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.userId;
        
        await UserModel.findByIdAndDelete(userId);
        await UserSettingsModel.findOneAndDelete({ userId });
        
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
});

// Example: Delete a user by ID
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // Replace with your database logic
        res.status(200).send({ message: `User with ID: ${userId} deleted` });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        // Map frontend field names to backend field names
        const { name, email, address, dateOfBirth, password } = req.body;
        
        const userData = {
            Name: name,
            Email: email,
            Address: address,
            DateOfBirth: dateOfBirth,
            Password: password
        };

        // List required fields as per your UserModel
        const requiredFields = ['Name', 'Email', 'DateOfBirth', 'Address', 'Password'];
        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {
            return res.status(400).send({ 
                success: false, 
                message: `Missing fields: ${missingFields.join(', ')}` 
            });
        }

        const newUser = await createUser(userData);
        res.status(201).send({ 
            success: true, 
            message: 'User created successfully', 
            user: newUser 
        });
    } catch (error) {
        res.status(500).send({ 
            success: false, 
            message: 'Failed to create user', 
            error: error.message 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).send({ error: 'Username and password are required' });
        }

        // Call the loginUser function from the service
        const user = await loginUser(username, password);

        // Return the user details and token
        res.status(200).send({ message: 'Login successful', data: user });
    } catch (error) {
        res.status(401).send({ error: 'Invalid credentials', details: error.message });
    }
});

export default router;