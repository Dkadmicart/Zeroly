// server/routes/uploadRoutes.js
import express from "express";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.get("/signature", protect, (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        const paramsToSign = {
            timestamp: timestamp,
            folder: "zeroly"
        };
        
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign, 
            cloudinary.config().api_secret
        );
        
        res.status(200).json({
            signature,
            timestamp,
            apiKey: cloudinary.config().api_key,
            cloudName: cloudinary.config().cloud_name
        });
    } catch (error) {
        logger.error({ err: error }, 'Signature generation failed');
        res.status(500).json({ message: "Failed to generate upload signature" });
    }
});

export default router;