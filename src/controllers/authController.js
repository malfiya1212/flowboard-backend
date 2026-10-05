const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: Generate signed JSON Web Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId },
        process.env.JWT_SECRET || 'flowboard_jwt_default_secret_key', { expiresIn: '7d' }
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate inputs
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required fields.',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long.',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check for existing user
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({
                message: 'An account with this email address already exists.',
            });
        }

        // Create user (password is automatically hashed via the schema pre-save hook)
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
        });

        const token = generateToken(user._id);

        return res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Server error occurred during registration.',
        });
    }
};

// @desc    Authenticate user & return token
// @route   POST /api/auth/login
// @access  Public
const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide both email and password.',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password combination.',
            });
        }

        // Validate password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password combination.',
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Server error occurred during login.',
        });
    }
};

module.exports = {
    register,
    login,
};