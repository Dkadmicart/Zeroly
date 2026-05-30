import Request from "../models/Request.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import logger from "../utils/logger.js";

export const updateRequestStatus = async(req, res) => {
    try {
        const { status } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }


        if (request.owner.toString() !== req.user._id.toString()) {
            return res
                .status(401)
                .json({ message: "Not authorized to update this request" });
        }

        request.status = status;
        await request.save();

        if (status === "Accepted") {
            const item = await Item.findById(request.item);
            if (item) {
                item.status = "requested";
                await item.save();
            }
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const getSentRequests = async(req, res) => {
    try {
        const requests = await Request.find({ requester: req.user._id })
            .populate("item", "name imageUrl")
            .populate("owner", "name");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};


export const getReceivedRequests = async(req, res) => {
    try {
        const requests = await Request.find({ owner: req.user._id })
            .populate("item", "name imageUrl")
            .populate("requester", "name");
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
export const createRequest = async(req, res) => {
    try {
        const { itemId } = req.body;
        const requesterId = req.user._id;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }


        if (item.user.toString() === requesterId.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot request your own item" });
        }

        const requesterUser = await User.findById(requesterId);
        const itemCost = item.ecoSeeds || 10;
        
        if (requesterUser.points < itemCost) {
            return res.status(400).json({ message: `Insufficient EcoSeeds. You need ${itemCost} EcoSeeds to request this item.` });
        }

        const existingRequest = await Request.findOne({
            item: itemId,
            requester: requesterId,
        });
        if (existingRequest) {
            return res
                .status(400)
                .json({ message: "You have already requested this item" });
        }

        const request = new Request({
            item: itemId,
            requester: requesterId,
            owner: item.user,
        });

        const createdRequest = await request.save();
        res.status(201).json(createdRequest);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const verifyHandshake = async(req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to verify this request" });
        }

        if (request.status !== "Accepted") {
            return res.status(400).json({ message: "Only accepted requests can be verified" });
        }

        request.status = "Completed";
        await request.save();

        const item = await Item.findById(request.item);
        if (item) {
            item.status = "given";
            await item.save();

            const itemCost = item.ecoSeeds || 10;
            
            // Deduct points from requester
            const requesterUser = await User.findById(request.requester);
            if (requesterUser) {
                requesterUser.points = Math.max(0, requesterUser.points - itemCost);
                await requesterUser.save();
            }

            // Award points to the donor (owner)
            const ownerUser = await User.findById(request.owner);
            if (ownerUser) {
                ownerUser.points += itemCost;
                await ownerUser.save();
            }

            // Log transactions
            await Transaction.create({
                user: request.requester,
                type: 'spent',
                amount: itemCost,
                description: `Requested item: ${item.name}`,
                relatedItem: item._id,
            });

            await Transaction.create({
                user: request.owner,
                type: 'earned',
                amount: itemCost,
                description: `Gave away item: ${item.name}`,
                relatedItem: item._id,
            });
        }

        res.json({ message: "Handshake successful, points awarded!", request });
    } catch (error) {
        logger.error({ err: error }, 'Handshake verification failed');
        res.status(500).json({ message: "Server Error" });
    }
};