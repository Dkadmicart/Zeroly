import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; 
import StarRating from "./StarRating"; 
import api from "../api.js";
import { Trash2, MessageCircle, Info } from "lucide-react";

const Reviews = ({ itemId, ownerId }) => {
  const { userInfo } = useContext(AuthContext) ?? {};
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [avg, setAvg] = useState(0);

  const isOwner = userInfo?._id === ownerId; 

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/items/${itemId}/reviews`);
      setReviews(data.reviews || []);
      setAvg(data.averageRating || 0);
    } catch (err) {
      console.error("Failed to fetch reviews:", err.response?.data?.message || err.message);
      setReviews([]);
      setAvg(0);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchReviews();
    }
  }, [itemId]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!rating || !comment) {
      alert("Please add both a rating and a comment to submit your review.");
      return;
    }
    if (!userInfo) {
      alert("You must be logged in to submit a review.");
      return;
    }

    try {
      await api.post(`/items/${itemId}/reviews`, { rating, comment });
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      console.error("Review submission failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to submit review. Please try again.");
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }
    if (!userInfo) {
      alert("You must be logged in to delete a review.");
      return;
    }

    try {
      await api.delete(`/items/${itemId}/reviews/${reviewId}`);
      fetchReviews(); 
    } catch (err) {
      console.error("Review deletion failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete review. Please try again.");
    }
  };

  return (
    <div className="mt-8">
      {/* Review Header Summary Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/40">
        <div>
          <h3 className="text-xl font-bold text-foreground">Community Reviews</h3>
          <p className="text-xs text-muted-foreground mt-0.5">What the community thinks about this item</p>
        </div>
        <div className="flex items-center gap-2.5 bg-card/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-border/40 shadow-sm w-fit">
          <span className="text-amber-500 text-lg font-bold">★</span>
          <span className="text-base font-extrabold text-foreground">{avg.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground font-semibold">/ 5.0</span>
          <span className="text-xs text-muted-foreground/60">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="p-8 text-center bg-card/20 backdrop-blur-sm border border-dashed border-border/40 rounded-3xl text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold">No reviews yet</p>
          <p className="text-xs text-muted-foreground/65 mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="p-5 bg-card/30 backdrop-blur-md border border-border/30 rounded-2xl shadow-sm hover:border-primary/20 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {/* User Avatar Initial */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/25 text-primary flex items-center justify-center font-bold text-sm shadow-inner select-none">
                    {r.name ? r.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-foreground block">{r.name}</strong>
                    <span className="text-[10px] text-muted-foreground font-medium block">Verified Reviewer</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg border border-amber-500/20 text-xs font-bold">
                    <span>★</span>
                    <span>{r.rating.toFixed(1)}</span>
                  </div>
                  {/* Conditional Delete Button */}
                  {userInfo && (isOwner || (r.user && userInfo._id === r.user.toString())) && (
                    <button
                      onClick={() => handleReviewDelete(r._id)}
                      className="p-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 hover:border-destructive/30 transition-all duration-200"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mt-3.5 pl-0.5">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Form */}
      {userInfo ? (
        isOwner ? (
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center text-xs font-medium text-primary flex items-center justify-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>You cannot review your own item.</span>
          </div>
        ) : (
          <form onSubmit={submitReview} className="mt-8 p-6 bg-card/40 backdrop-blur-xl border border-border/40 rounded-3xl shadow-lg">
            <h4 className="text-base font-bold text-foreground mb-1">Submit Your Review</h4>
            <p className="text-xs text-muted-foreground mb-4">Share your feedback to help other members of the community.</p>
            
            <div className="mb-4 bg-background/30 p-3.5 rounded-2xl border border-border/40 w-fit flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">Select Rating:</span>
              <div className="flex items-center scale-110 origin-left">
                <StarRating value={rating} onChange={setRating} />
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this item..."
              rows="4"
              className="w-full bg-background/50 border border-border/60 text-foreground rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-muted-foreground/60 transition-all duration-200 resize-none text-sm outline-none"
            />
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 text-sm hover:scale-[1.01]"
              >
                Submit Review
              </button>
            </div>
          </form>
        )
      ) : (
        <div className="mt-8 p-4 bg-muted/50 border border-border rounded-2xl text-center text-xs font-medium text-muted-foreground">
          <span>Please <Link to="/login" className="text-primary hover:underline font-bold">login</Link> to write a review.</span>
        </div>
      )}
    </div>
  );
};

export default Reviews;