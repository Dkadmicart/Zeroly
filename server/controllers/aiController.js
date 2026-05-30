import { analyzeItemImage, checkRateLimit } from '../services/aiService.js';
import logger from '../utils/logger.js';

/**
 * @desc    Analyze item image using Gemini and return suggested fields
 * @route   POST /api/ai/analyze
 * @access  Private
 */
export const analyzeImage = async (req, res) => {
    try {
        const { imageUrl, imageBase64 } = req.body;

        if (!imageUrl && !imageBase64) {
            return res.status(400).json({ message: "Image data is required" });
        }

        // Rate limit: 10 requests per user per hour (3600 seconds)
        const rateLimit = await checkRateLimit(`ai:analyze:${req.user._id}`, 10, 3600);
        if (!rateLimit.success) {
            return res.status(429).json({ 
                message: "AI analysis rate limit exceeded. Please try again later." 
            });
        }

        const suggestion = await analyzeItemImage(imageUrl, imageBase64);

        // Map the category to our supported categories if necessary
        // Assuming Gemini is prompted to return one of the predefined ones.
        
        // Return structured data for the frontend to autofill
        res.json({
            success: true,
            suggestion
        });

    } catch (error) {
        logger.error({ err: error }, 'Analyze image route failed');
        res.status(500).json({ message: "Failed to analyze image with AI" });
    }
};
