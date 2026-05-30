import Wishlist from '../models/Wishlist.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlists
 * @access  Private
 */
export const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, keywords: [] });
        }
        res.json(wishlist);
    } catch (error) {
        logger.error({ err: error }, 'Get wishlist failed');
        res.status(500).json({ message: "Server Error" });
    }
};

/**
 * @desc    Update user's wishlist
 * @route   PUT /api/wishlists
 * @access  Private
 */
export const updateWishlist = async (req, res) => {
    try {
        const { keywords, isActive } = req.body;
        
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id });
        }

        if (keywords !== undefined) {
            wishlist.keywords = keywords.map(k => k.toLowerCase().trim()).filter(k => k);
        }
        if (isActive !== undefined) {
            wishlist.isActive = isActive;
        }

        await wishlist.save();
        res.json(wishlist);
    } catch (error) {
        logger.error({ err: error }, 'Update wishlist failed');
        res.status(500).json({ message: "Server Error" });
    }
};
