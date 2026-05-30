import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { analyzeImage } from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze', protect, analyzeImage);

export default router;
