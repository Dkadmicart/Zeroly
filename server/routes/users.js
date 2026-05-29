// server/routes/users.js
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  googleLoginUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/google-login", authLimiter, googleLoginUser);
router.route("/profile").get(protect, getUserProfile);

export default router;
