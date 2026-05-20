import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Reviews from "../components/Reviews";
import StarRating from "../components/StarRating"; 
import api from "../api.js";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, MessageCircle, HandHeart, Info, Navigation, Share2, Coins } from "lucide-react";

const API_BASE_URL = "http://localhost:5001/api"; 

const ItemDetailsPage = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`${API_BASE_URL}/items/${id}`); 
        setItem(data);
      } catch (error) {
        console.error("Failed to fetch item details:", error);
        toast.error("Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleMessageOwner = async () => {
    if (!userInfo) return navigate("/login");
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/chat/start`,
        { itemId: item._id },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      navigate(`/chat/${data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to start chat");
    }
  };

  const handleRequest = async () => {
    if (!userInfo) {
      toast.error("Please log in to request an item.");
      navigate("/login");
      return;
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
  
      await axios.post(`${API_BASE_URL}/requests`, { itemId: item._id }, config);
      toast.success("Request sent successfully!");
    } catch (error) {
      console.error("Failed to send request:", error);
      toast.error(error.response?.data?.message || "Failed to send request.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4">Item not found</h2>
        <Button asChild><Link to="/explore">Back to Explore</Link></Button>
      </div>
    );
  }

  const isOwner = userInfo && userInfo._id === item.user;

  return (
    <div className="bg-background min-h-screen py-12 font-sans relative z-0">
      <div className="fixed inset-0 -z-10 h-full w-full bg-grid-pattern pointer-events-none opacity-40"></div>
      
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* Left Column - Image Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm border border-border/50 shadow-xl group aspect-square lg:aspect-[4/3] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50 z-0 pointer-events-none"></div>
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain rounded-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
              />
              
              {/* Category Badge Floating */}
              <div className="absolute top-6 left-6 z-20">
                <span className="bg-background/80 backdrop-blur-md text-foreground font-semibold px-4 py-2 rounded-full shadow-lg border border-border flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  {item.category}
                </span>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-card/50 backdrop-blur-md border border-border p-8 rounded-3xl shadow-sm">
              <h3 className="text-2xl font-bold text-foreground mb-4">About this item</h3>
              <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          </div>

          {/* Right Column - Sticky Action Box */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-6">
              
              {/* Main Checkout Card */}
              <Card className="bg-card/80 backdrop-blur-xl border-border/60 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                      {item.name}
                    </h1>
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0" title="Share">
                      <Share2 className="w-5 h-5 text-muted-foreground hover:text-primary" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 bg-primary/10 text-primary w-fit px-4 py-2 rounded-xl font-bold border border-primary/20">
                    <Coins className="w-5 h-5" />
                    {item.ecoSeeds || 10} EcoSeeds
                  </div>
              
                  <div className="flex items-center gap-3 mb-6 bg-muted/50 p-3 rounded-2xl border border-border/50 w-fit">
                    <StarRating value={item.averageRating || 0} readOnly />
                    <span className="text-sm font-medium text-foreground">
                      {item.averageRating ? item.averageRating.toFixed(1) : "New"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({item.numReviews || 0} reviews)
                    </span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-muted-foreground bg-background/50 p-4 rounded-2xl border border-border">
                      <MapPin className="w-6 h-6 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1">Pickup Location</p>
                        <p className="font-medium text-foreground">{item.address || "Location hidden until requested"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    {userInfo && !isOwner && (
                      <>
                        <Button
                          onClick={handleRequest}
                          size="lg"
                          disabled={userInfo.points < (item.ecoSeeds || 10)}
                          className={`w-full h-14 text-lg font-bold rounded-2xl transition-all ${
                            userInfo.points < (item.ecoSeeds || 10) 
                              ? "bg-muted text-muted-foreground" 
                              : "shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          <HandHeart className="w-5 h-5 mr-2" />
                          {userInfo.points < (item.ecoSeeds || 10) 
                            ? `Need ${item.ecoSeeds || 10} EcoSeeds (You have ${userInfo.points || 0})` 
                            : `Request for ${item.ecoSeeds || 10} EcoSeeds`}
                        </Button>
                
                        <Button
                          onClick={handleMessageOwner}
                          variant="outline"
                          size="lg"
                          className="w-full h-14 text-lg font-bold rounded-2xl border-2 hover:bg-accent"
                        >
                          <MessageCircle className="w-5 h-5 mr-2 text-primary" />
                          Message Owner
                        </Button>
                      </>
                    )}

                    {isOwner && (
                      <div className="p-4 bg-primary/10 text-primary border border-primary/20 text-center rounded-2xl font-medium flex items-center justify-center gap-2">
                        <Info className="w-5 h-5" />
                        You own this item
                      </div>
                    )}

                    {!userInfo && (
                      <div className="p-5 bg-muted/50 border border-border text-center rounded-2xl">
                        <p className="text-muted-foreground mb-4 font-medium">Please log in to request or message.</p>
                        <Button asChild className="w-full rounded-xl h-12">
                          <Link to="/login">Sign In</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips Card */}
              <Card className="bg-card/40 backdrop-blur-sm border-dashed border-border/60 shadow-sm rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Local Pickup Tips</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Always arrange to meet in a public, well-lit place. Ensure you have communicated clearly via in-app messaging before sharing personal contact details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 border-t border-border pt-12"
        >
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-foreground mb-8">Community Reviews</h2>
            <Reviews itemId={item._id} ownerId={item.user} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ItemDetailsPage;