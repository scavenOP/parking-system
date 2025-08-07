import express from 'express';
import UserModel from '../Models/User-Model.js';
import { getUserById, createUser } from '../Services/UserService.js';
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

// Example: Get a user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // Replace with your database logic
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error', details: error.message });
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

// Example: Update a user by ID
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;
        // Replace with your database logic
        res.status(200).send({ message: `User with ID: ${userId} updated`, data: updatedData });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
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

export default router;