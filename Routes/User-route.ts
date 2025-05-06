import express, { Request, Response } from 'express';
import UserRepository from '../Repositories/User-repo';
import { User } from '../Models/User';

const router = express.Router();

// Example: Get all users
// router.get('/', hello);

// Example: Get a user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        // Replace with your database logic
        res.status(200).send({ message: `Get user with ID: ${userId}` });
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Example: Create a new user
router.post('/', async (req: Request, res: Response) => {
    try {
        const user: IUser = req.body;

        // Validate request body
        if (!user.username || !user.password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Pass the typed object to the repository
        const newUser = await userRepo.createUser(user);
        res.status(201).json({ message: 'User created', data: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
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