import express from "express";
import { getTransactions, createRazorpayOrder, verifyPayment } from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/transactions").get(protect, getTransactions);
router.route("/create-order").post(protect, createRazorpayOrder);
router.route("/verify-payment").post(protect, verifyPayment);

export default router;
