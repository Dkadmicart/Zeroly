// server/controllers/userController.js
import User from "../models/User.js";
import Item from "../models/Item.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import logger from "../utils/logger.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};


export const registerUser = async(req, res) => {

    logger.debug('Register user endpoint hit');
    // SECURITY: Never log req.body on auth routes — it contains passwords and PII.


    try {
        const { name, email, password } = req.body;


        if (!name || !email || !password) {
            logger.debug('Registration validation failed: missing required fields');
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            logger.debug('Registration rejected: user already exists');
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password, points: 1 });

        if (user) {
            logger.info('User registered successfully');
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {

            logger.warn('User creation failed for an unknown reason');
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {

        logger.error({ err: error }, 'Registration failed');
        res.status(500).json({ message: "Server Error" });
    }
};


export const loginUser = async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
};

export const getUserProfile = async(req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (user) {

            const items = await Item.find({ user: req.user._id });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                points: user.points,
                itemCount: user.itemCount,
                items: items,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const googleLoginUser = async(req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: "Google token is missing" });
        }
        
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });
        
        const payload = ticket.getPayload();
        const { email, name } = payload;
        
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({ 
                name, 
                email, 
                authProvider: 'google',
                points: 1
            });
        }
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
        
    } catch (error) {
        logger.error({ err: error }, 'Google authentication failed');
        res.status(401).json({ message: "Invalid Google token" });
    }
};

export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Please provide an email" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // We still return 200 to prevent email enumeration attacks
            return res.status(200).json({ message: "If that email exists, a reset link was sent." });
        }

        // Generate a fake/temporary reset token and URL for now (or real logic if needed)
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // Send the email
        const { sendPasswordResetEmail } = await import('../services/emailService.js');
        await sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json({ message: "Password reset link sent to your email!" });
    } catch (error) {
        logger.error({ err: error }, 'Forgot password failed');
        res.status(500).json({ message: "Server Error" });
    }
};