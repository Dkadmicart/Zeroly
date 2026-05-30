// server/controllers/itemController.js

import Item from "../models/Item.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";


export const getItemById = async(req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: "Item not found" });
        }
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch item by ID');
        res.status(500).json({ message: "Server Error" });
    }
};


export const createItem = async(req, res) => {
    try {
        const { name, description, category, imageUrl, address, location, ecoSeeds } = req.body;

        const item = new Item({
            name,
            description,
            category,
            imageUrl,
            address,
            ecoSeeds: ecoSeeds || 10,
            location: location ? { type: 'Point', coordinates: location } : undefined,
            user: req.user._id,
        });

        const createdItem = await item.save();


        const user = await User.findById(req.user._id);
        if (user) {
            user.itemCount += 1;
            await user.save();
        }

        res.status(201).json(createdItem);
    } catch (error) {
        logger.error({ err: error }, 'Failed to create item');
        res.status(500).json({ message: "Error creating item", error: error.message });
    }
};


export const getItems = async(req, res) => {
    try {
        const { keyword, category, lat, lng, radius, page = 1 } = req.query;
        let query = { status: { $in: ['available', null] } };

        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (lat && lng && radius) {
            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
                }
            };
        }

        const pageSize = 12;
        const pageNum = Number(page) || 1;

        const total = await Item.countDocuments(query);
        const items = await Item.find(query)
            .sort({ createdAt: -1 })
            .skip(pageSize * (pageNum - 1))
            .limit(pageSize);

        res.json({
            items,
            page: pageNum,
            pages: Math.ceil(total / pageSize),
            total
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch items');
        res
            .status(500)
            .json({ message: "Error fetching items", error: error.message });
    }
};



export const deleteItem = async(req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }


        logger.debug('Delete authorization check — item owner: %s, requester: %s', item.user.toString(), req.user._id.toString());

        if (item.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this item" });
        }


        const user = await User.findById(item.user);
        if (user) {
            user.itemCount = Math.max(0, user.itemCount - 1);
            await user.save();
        }

        await item.deleteOne();
        res.json({ message: "Item removed successfully" });
    } catch (error) {
        logger.error({ err: error }, 'Failed to delete item');
        res.status(500).json({ message: "Error deleting item", error: error.message });
    }
};



export const getItemReviews = async(req, res) => {
    try {
        const item = await Item.findById(req.params.id).select(
            "reviews numReviews averageRating"
        );

        if (!item) return res.status(404).json({ message: "Item not found" });

        res.json({
            reviews: item.reviews,
            numReviews: item.numReviews,
            averageRating: item.averageRating,
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to fetch reviews');
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
};


export const addItemReview = async(req, res) => {
    try {
        const { rating, comment } = req.body;
        const item = await Item.findById(req.params.id);

        if (!item) return res.status(404).json({ message: "Item not found" });


        if (item.user.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot review your own item" });
        }


        const alreadyReviewed = item.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this item" });
        }

        const review = {
            user: req.user._id,
            name: req.user.name || "Anonymous",
            rating: Number(rating),
            comment,
        };

        item.calcRating();
        await item.save();
        res.status(201).json({
            message: "Review added",
            reviews: item.reviews,
            averageRating: item.averageRating,
            numReviews: item.numReviews
        });
    } catch (error) {
        logger.error({ err: error }, 'Failed to add review');
        res.status(500).json({ message: "Failed to add review", error: error.message });
    }
};


export const deleteItemReview = async(req, res) => {
    try {
        const { itemId, reviewId } = req.params;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const review = item.reviews.id(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }


        const isItemOwner = item.user.toString() === req.user._id.toString();
        const isReviewAuthor = review.user.toString() === req.user._id.toString();

        if (!isItemOwner && !isReviewAuthor) {
            return res.status(401).json({ message: 'Not authorized to delete this review.' });
        }

        review.deleteOne();

        item.calcRating();
        await item.save();

        res.status(200).json({
            message: 'Review deleted successfully',
            averageRating: item.averageRating,
            numReviews: item.numReviews
        });

    } catch (error) {
        logger.error({ err: error }, 'Failed to delete review for item %s', req.params.itemId);
        res.status(500).json({ message: 'Server error while deleting review.', error: error.message });
    }
};