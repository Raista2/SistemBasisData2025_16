const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/baseResponse.util');
const authRepository = require('../repositories/auth.repository');
require('dotenv').config();

exports.register = async (req, res) => {
    try {
        const { username, email, password, isAdmin, adminCode } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return baseResponse(res, false, 400, 'Username, email, and password are required', null);
        }

        // Check if user already exists
        const existingUser = await authRepository.getUserByEmail(email);
        if (existingUser) {
            return baseResponse(res, false, 409, 'User with this email already exists', null);
        }

        // Admin verification
        let role = 'user';
        if (isAdmin) {
            // Check if admin code is provided and matches the secret
            if (!adminCode) {
                return baseResponse(res, false, 400, 'Admin registration code is required', null);
            }
            
            if (adminCode !== process.env.ADMIN_REGISTRATION_SECRET) {
                return baseResponse(res, false, 403, 'Invalid admin registration code', null);
            }
            
            role = 'admin';
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await authRepository.createUser({
            username,
            email,
            password: hashedPassword,
            role
        });

        // Remove password from response
        delete newUser.password;

        return baseResponse(res, true, 201, 'User registered successfully', newUser);
    } catch (error) {
        console.error('Register error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return baseResponse(res, false, 400, 'Email and password are required', null);
        }

        // Check if user exists
        const user = await authRepository.getUserByEmail(email);
        if (!user) {
            return baseResponse(res, false, 401, 'Invalid credentials', null);
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return baseResponse(res, false, 401, 'Invalid credentials', null);
        }

        // Create token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        delete user.password;

        return baseResponse(res, true, 200, 'Login successful', {
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

exports.logout = (req, res) => {
    return baseResponse(res, true, 200, 'Logout successful', null);
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await authRepository.getUserById(req.user.id);
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }

        // Remove password from response
        delete user.password;

        return baseResponse(res, true, 200, 'Current user retrieved successfully', user);
    } catch (error) {
        console.error('Get current user error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};