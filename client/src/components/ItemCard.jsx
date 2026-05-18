import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin } from "lucide-react";

const ItemCard = ({ item, userId, onDelete }) => {
  const isOwner = userId === item.user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col group bg-card/40 backdrop-blur-xl border border-border/40 hover:border-primary/30 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative">
        {/* Floating Glassmorphic Category Badge */}
        <span className="absolute top-3 right-3 z-10 bg-background/70 backdrop-blur-md border border-border/40 text-foreground text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm select-none">
          {item.category}
        </span>

        {/* Floating Delete Button (For Owner) */}
        {isOwner && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(item._id);
            }}
            className="absolute top-3 left-3 z-10 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 hover:border-destructive/30 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center shadow-sm cursor-pointer transition-all duration-200 hover:scale-105"
            title="Delete Listing"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        )}

        {/* Image Section */}
        <Link to={`/item/${item._id}`} className="overflow-hidden block aspect-video sm:aspect-square md:aspect-video relative group-hover:after:opacity-100 after:absolute after:inset-0 after:bg-gradient-to-t after:from-background/25 after:to-transparent after:opacity-0 after:transition-opacity after:duration-300">
          <img
            src={item.imageUrl || "/placeholder-item.png"}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Content Section */}
        <CardHeader className="p-5 pb-0 flex-grow text-left">
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Star rating */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <StarRating value={item.averageRating || 0} readOnly size={14} />
                <span className="text-xs text-muted-foreground font-semibold">
                  ({item.numReviews || 0})
                </span>
              </div>

              {/* Item Title */}
              <h3 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
                <Link to={`/item/${item._id}`} className="block w-full">
                  {item.name}
                </Link>
              </h3>

              {/* Item Description */}
              <p className="text-muted-foreground text-sm leading-relaxed mt-2 line-clamp-2 h-10">
                {item.description}
              </p>
            </div>
          </div>
        </CardHeader>

        {/* Footer Address Panel */}
        <CardContent className="p-5 pt-4 mt-auto border-t border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground/85 hover:text-foreground transition-colors duration-200">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs font-semibold truncate select-none">
              {item.address || "Local Sharing"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ItemCard;
