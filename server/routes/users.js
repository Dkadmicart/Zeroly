// server/routes/users.js
import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  googleLoginUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLoginUser);
router.route("/profile").get(protect, getUserProfile);

export default router;
