import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Sprout, Leaf, TreePine, Crown, Coins } from "lucide-react";
import api from "../api.js";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const getTierInfo = (points) => {
  if (points >= 151) return { name: "Canopy", icon: <Crown className="w-5 h-5 text-yellow-500" />, color: "text-yellow-500", bg: "bg-yellow-500/10", next: null };
  if (points >= 51) return { name: "Bloom", icon: <TreePine className="w-5 h-5 text-emerald-500" />, color: "text-emerald-500", bg: "bg-emerald-500/10", next: 151 };
  if (points >= 21) return { name: "Sprout", icon: <Sprout className="w-5 h-5 text-green-500" />, color: "text-green-500", bg: "bg-green-500/10", next: 51 };
  return { name: "Seed", icon: <Leaf className="w-5 h-5 text-amber-600" />, color: "text-amber-600", bg: "bg-amber-600/10", next: 21 };
};

const LeaderboardPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get("/leaderboard");
        setLeaders(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const topThree = leaders.slice(0, 3);
  const restOfLeaders = leaders.slice(3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-32 pt-20 px-4 md:px-8">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-primary/10 rounded-2xl ring-1 ring-primary/20 backdrop-blur-sm">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Leaderboard</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            Earn <strong className="text-primary">EcoCoins</strong> by sharing items and climbing the ranks. Will you reach the Canopy?
          </p>
        </motion.div>

        {/* Podium for Top 3 */}
        {topThree.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-6 mb-16 h-auto md:h-72">
            
            {/* 2nd Place */}
            {topThree[1] && (
              <motion.div variants={itemVariants} className="w-full md:w-1/3 order-2 md:order-1 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-slate-300/20 ring-4 ring-slate-300 flex items-center justify-center text-2xl font-bold text-slate-400 shadow-[0_0_30px_rgba(203,213,225,0.3)]">
                    {topThree[1].name.charAt(0).toUpperCase()}
                  </div>
                  <Medal className="absolute -bottom-3 -right-3 w-8 h-8 text-slate-400 drop-shadow-md" />
                </div>
                <div className="bg-card/40 backdrop-blur-xl border border-slate-300/30 p-6 rounded-t-2xl w-full text-center h-32 md:h-40 flex flex-col justify-end pb-6">
                  <h3 className="font-bold text-lg text-foreground truncate">{topThree[1].name}</h3>
                  <div className="flex items-center justify-center text-slate-400 font-semibold mt-1">
                    <Coins className="w-4 h-4 mr-1" /> {topThree[1].points} EcoCoins
                  </div>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            <motion.div variants={itemVariants} className="w-full md:w-1/3 order-1 md:order-2 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-yellow-400/20 ring-4 ring-yellow-400 flex items-center justify-center text-4xl font-bold text-yellow-500 shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                  {topThree[0].name.charAt(0).toUpperCase()}
                </div>
                <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 drop-shadow-lg" />
              </div>
              <div className="bg-card/60 backdrop-blur-xl border border-yellow-400/50 p-6 rounded-t-2xl w-full text-center h-36 md:h-48 flex flex-col justify-end pb-8 shadow-[0_-10px_40px_rgba(250,204,21,0.1)]">
                <h3 className="font-bold text-xl text-foreground truncate">{topThree[0].name}</h3>
                <div className="flex items-center justify-center text-yellow-500 font-bold mt-1 text-lg">
                  <Coins className="w-5 h-5 mr-1" /> {topThree[0].points} EcoCoins
                </div>
              </div>
            </motion.div>

            {/* 3rd Place */}
            {topThree[2] && (
              <motion.div variants={itemVariants} className="w-full md:w-1/3 order-3 md:order-3 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-amber-600/20 ring-4 ring-amber-600 flex items-center justify-center text-2xl font-bold text-amber-600 shadow-[0_0_30px_rgba(217,119,6,0.3)]">
                    {topThree[2].name.charAt(0).toUpperCase()}
                  </div>
                  <Medal className="absolute -bottom-3 -right-3 w-8 h-8 text-amber-600 drop-shadow-md" />
                </div>
                <div className="bg-card/40 backdrop-blur-xl border border-amber-600/30 p-6 rounded-t-2xl w-full text-center h-32 md:h-36 flex flex-col justify-end pb-6">
                  <h3 className="font-bold text-lg text-foreground truncate">{topThree[2].name}</h3>
                  <div className="flex items-center justify-center text-amber-600 font-semibold mt-1">
                    <Coins className="w-4 h-4 mr-1" /> {topThree[2].points} EcoCoins
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}

        {/* List for Rank 4+ */}
        {restOfLeaders.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            {restOfLeaders.map((user, index) => {
              const rank = index + 4;
              const tierInfo = getTierInfo(user.points);
              
              return (
                <motion.div key={user.name} variants={itemVariants}>
                  <Card className={`bg-card/40 backdrop-blur-xl border-border/50 hover:bg-card/60 transition-all group ${userInfo?.name === user.name ? 'ring-2 ring-primary border-primary' : ''}`}>
                    <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-8 font-bold text-muted-foreground text-lg">#{rank}</div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-lg flex items-center gap-2">
                            {user.name}
                            {userInfo?.name === user.name && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">You</span>}
                          </span>
                          <span className="text-sm text-muted-foreground">{user.itemCount} Items Uploaded</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 font-bold text-lg">
                          {user.points} <Coins className="w-4 h-4 text-primary" />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${tierInfo.bg} ${tierInfo.color}`}>
                          {tierInfo.icon} {tierInfo.name}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default LeaderboardPage;
