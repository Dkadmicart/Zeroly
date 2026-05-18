import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

const itemSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    address: { type: String, required: true },

    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    },
    status: {
        type: String,
        enum: ['available', 'requested', 'given'],
        default: 'available'
    },

    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
}, { timestamps: true });

itemSchema.index({ location: "2dsphere" });


itemSchema.methods.calcRating = function() {
    this.numReviews = this.reviews.length;
    this.averageRating =
        this.numReviews === 0 ?
        0 :
        this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.numReviews;
};

const Item = mongoose.model("Item", itemSchema);
export default Item;