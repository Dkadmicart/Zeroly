// server/controllers/requestController.js
import Request from "../models/Request.js";
import Item from "../models/Item.js";

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
                item.status = "given";
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