import Item from '../models/Item.js';
import { extractSearchIntent } from '../services/aiService.js';
import logger from '../utils/logger.js';

/**
 * @desc    Semantic search items using Groq intent extraction
 * @route   GET /api/search/semantic
 * @access  Public
 */
export const semanticSearch = async (req, res) => {
    try {
        const { q, lat, lng, radius, page = 1 } = req.query;
        if (!q || q.trim() === '') {
            return res.json({ items: [], page: 1, pages: 1, total: 0 });
        }

        // 1. Extract intent using Groq
        const keywords = await extractSearchIntent(q);
        
        logger.debug('Semantic search keywords: %o', keywords);

        // 2. Build MongoDB query
        const regexes = keywords.map(kw => new RegExp(kw, 'i'));
        
        const query = {
            status: { $in: ['available', null] },
            $or: [
                { name: { $in: regexes } },
                { description: { $in: regexes } },
                { category: { $in: regexes } }
            ]
        };

        if (lat && lng && radius) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(radius) * 1000
                }
            };
        }

        // 3. Execute query
        const pageSize = 12;
        const pageNum = Number(page) || 1;

        const total = await Item.countDocuments(query);
        const items = await Item.find(query)
            .populate("user", "name username avatar")
            .sort({ createdAt: -1 })
            .skip(pageSize * (pageNum - 1))
            .limit(pageSize);

        res.json({
            success: true,
            intent: keywords,
            items,
            page: pageNum,
            pages: Math.ceil(total / pageSize),
            total
        });

    } catch (error) {
        logger.error({ err: error }, 'Semantic search failed');
        res.status(500).json({ message: "Search failed" });
    }
};
