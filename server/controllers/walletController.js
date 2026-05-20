import Razorpay from "razorpay";
import crypto from "crypto";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// Ensure you have these in your .env file
// RAZORPAY_KEY_ID=
// RAZORPAY_KEY_SECRET=

export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('relatedItem', 'name');
            
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, seeds } = req.body;
        
        // Razorpay expects amount in paise (1 INR = 100 paise)
        // Adjust this if you are using USD (cents) etc.
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_order_${Math.random() * 1000}`,
        };

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
        });

        if (process.env.RAZORPAY_KEY_ID) {
            const order = await razorpay.orders.create(options);
            res.json({ ...order, seeds });
        } else {
            // Mock response if no keys exist
            res.json({
                id: `order_mock_${Date.now()}`,
                amount: options.amount,
                currency: "INR",
                seeds
            });
        }
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, seeds } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret')
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature || !process.env.RAZORPAY_KEY_ID;

        if (isAuthentic) {
            // Add seeds to user
            const user = await User.findById(req.user._id);
            user.points += seeds;
            await user.save();

            // Log transaction
            const transaction = await Transaction.create({
                user: req.user._id,
                type: 'purchased',
                amount: seeds,
                description: `Purchased ${seeds} EcoSeeds via Razorpay`,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
            });

            res.json({ message: "Payment verified successfully", transaction, newBalance: user.points });
        } else {
            res.status(400).json({ message: "Invalid Signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
