import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getWishlist, updateWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.route('/')
    .get(protect, getWishlist)
    .put(protect, updateWishlist);

export default router;
