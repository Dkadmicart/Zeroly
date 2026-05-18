// server/controllers/userController.js
import User from "../models/User.js";
import Item from "../models/Item.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};


export const registerUser = async(req, res) => {

    console.log('--- "Register User" endpoint hit ---');
    console.log("Request Body:", req.body);


    try {
        const { name, email, password } = req.body;


        if (!name || !email || !password) {
            console.log("Validation failed: Missing name, email, or password.");
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log("User already exists in database.");
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password });

        if (user) {
            console.log("User created successfully in database.");
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {

            console.log("User creation failed for an unknown reason.");
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {

        console.error("---!! SERVER ERROR DURING REGISTRATION !!---");
        console.error(error);
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
                authProvider: 'google' 
            });
        }
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
        
    } catch (error) {
        console.error("Google authentication error:", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
};