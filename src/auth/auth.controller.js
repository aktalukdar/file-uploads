const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const prisma = require('../prisma'); // your prisma client instance
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    const user = await authService.validateUser(email, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = authService.generateToken(user);
    res.json({ token });
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: 'User created successfully', userId: newUser.id });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
