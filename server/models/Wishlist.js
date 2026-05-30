import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "User" 
    },
    keywords: [{ 
        type: String, 
        trim: true 
    }],
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

// Create an index for faster lookups
wishlistSchema.index({ user: 1 });
// Text index for semantic-like quick matching if needed
wishlistSchema.index({ keywords: "text" });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
