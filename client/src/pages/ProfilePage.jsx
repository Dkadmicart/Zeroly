import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ItemCard from "../components/ItemCard";
import api from "../api.js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { User, Mail, Package, Sprout, Leaf, TreePine, Crown, Coins } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const API_BASE_URL = "http://localhost:5001/api"; 

const getTierInfo = (points) => {
  if (points >= 151) return { name: "Canopy", icon: <Crown className="w-5 h-5 text-yellow-500" />, color: "text-yellow-500", bg: "bg-yellow-500/10", next: null };
  if (points >= 51) return { name: "Bloom", icon: <TreePine className="w-5 h-5 text-emerald-500" />, color: "text-emerald-500", bg: "bg-emerald-500/10", next: 151 };
  if (points >= 21) return { name: "Sprout", icon: <Sprout className="w-5 h-5 text-green-500" />, color: "text-green-500", bg: "bg-green-500/10", next: 51 };
  return { name: "Seed", icon: <Leaf className="w-5 h-5 text-amber-600" />, color: "text-amber-600", bg: "bg-amber-600/10", next: 21 };
};

const ProfilePage = () => {
  const { userInfo } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userInfo) {
        setLoading(false);
        return;
      }
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
       
        const { data } = await api.get(`${API_BASE_URL}/users/profile`, config); 
        setUserProfile(data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Could not fetch user profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userInfo]);

  const handleDelete = async (deletedItemId) => {
    if (!userInfo) {
      toast.error("You must be logged in to delete an item.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
     
      await axios.delete(`${API_BASE_URL}/items/${deletedItemId}`, config);
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        items: prevProfile.items.filter((item) => item._id !== deletedItemId),
      }));
      toast.success("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(
        error.response?.data?.message || "You are not authorized to delete this item."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">Could not load profile. Please log in.</p>
      </div>
    );
  }

  const currentUserTier = getTierInfo(userProfile.points || 0);
  const progressToNext = currentUserTier.next 
    ? ((userProfile.points || 0) / currentUserTier.next) * 100 
    : 100;

  return (
    <div className="bg-background min-h-screen font-sans transition-colors duration-300 relative z-0 pt-10 pb-20">
      <div className="fixed inset-0 -z-10 h-full w-full bg-grid-pattern pointer-events-none"></div>

      <div className="container mx-auto p-4 md:px-8 max-w-7xl">
        {/* Profile Details Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="bg-card/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <CardHeader className="pb-4 border-b border-border/40">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Profile Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h1 className="text-3xl font-extrabold text-foreground mb-1">
                    {userProfile.name}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 text-lg">
                    <Mail className="w-5 h-5" />
                    {userProfile.email}
                  </p>
                </div>

                {/* Embedded Progress Bar */}
                <div className="bg-background/50 rounded-xl p-4 border border-border/40 mt-4 max-w-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${currentUserTier.bg} ${currentUserTier.color}`}>
                      {currentUserTier.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        Tier: <span className={currentUserTier.color}>{currentUserTier.name}</span>
                      </h4>
                      <p className="text-sm font-semibold flex items-center gap-1 text-primary">
                        <Coins className="w-4 h-4" /> {userProfile.points || 0} EcoCoins Earned
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full">
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-muted-foreground">Progress to {currentUserTier.next ? "Next Tier" : "Max Tier"}</span>
                      <span className="text-primary">{currentUserTier.next ? `${userProfile.points || 0} / ${currentUserTier.next}` : "MAX"}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2 bg-primary/20" />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 lg:self-center shrink-0">
                <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                  <Link to="/upload" className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    List New Item
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Listed Items Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              Your Listed Items
            </h2>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary/20">
              {userProfile.items.length} {userProfile.items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {userProfile.items.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-md border-dashed border-border p-12 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No items listed yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start sharing with your community by listing items you no longer need.
              </p>
              <Button asChild>
                <Link to="/upload">List Your First Item</Link>
              </Button>
            </Card>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              <AnimatePresence>
                {userProfile.items.map((item) => (
                  <ItemCard 
                    key={item._id} 
                    item={item} 
                    onDelete={handleDelete} 
                    userId={userInfo?._id} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
