import React, { useRef, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Leaf, MapPin, HandHeart } from "lucide-react";

const HomePage = () => {
  const location = useLocation();
  const heroSectionRef = useRef(null);
  const aboutUsSectionRef = useRef(null);

  useLayoutEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      let elementToScroll = null;
      if (id === 'hero-section' && heroSectionRef.current) {
        elementToScroll = heroSectionRef.current;
      } else if (id === 'about-us-section' && aboutUsSectionRef.current) {
        elementToScroll = aboutUsSectionRef.current;
      } else {
        elementToScroll = document.getElementById(id);
      }
      if (elementToScroll) {
        elementToScroll.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="bg-background min-h-screen font-sans transition-colors duration-300 relative z-0">
      <div className="fixed inset-0 -z-10 h-full w-full bg-grid-pattern pointer-events-none"></div>
      
      <Hero ref={heroSectionRef} />

      {/* Visual Features Section - SaaS Bento Style */}
      <div className="container mx-auto px-4 md:px-8 mt-8 mb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/upload" className="bg-card/60 backdrop-blur-xl border border-border/50 p-8 rounded-3xl shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col items-center text-center group h-full cursor-pointer block">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-500 transition-colors">1. Declutter Eco-Friendly</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Snap a picture of items you no longer need. Give them a second life instead of sending them to a landfill.
              </p>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/explore" className="bg-card/60 backdrop-blur-xl border border-border/50 p-8 rounded-3xl shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all flex flex-col items-center text-center group h-full cursor-pointer block">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-blue-500 transition-colors">2. Discover Locally</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Use our location search to find treasures in your neighborhood. Less travel means a lower carbon footprint.
              </p>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/requests" className="bg-card/60 backdrop-blur-xl border border-border/50 p-8 rounded-3xl shadow-lg hover:shadow-teal-500/20 hover:border-teal-500/50 transition-all flex flex-col items-center text-center group h-full cursor-pointer block">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                <HandHeart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-teal-500 transition-colors">3. Connect & Share</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Chat securely through the platform, arrange a pickup, and support a sustainable, circular local economy.
              </p>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto p-4 py-8 md:px-8">
        {/* About Us Section */}
        <motion.div
          ref={aboutUsSectionRef}
          id="about-us-section"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-8 py-16 px-6 rounded-3xl shadow-2xl md:px-16
                       transition-all duration-300 ease-in-out hover:shadow-primary/10
                       relative overflow-hidden group border border-border/50 bg-card/60 backdrop-blur-xl"
        >
          {/* Subtle gradient glow in the background instead of a bulky image */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none transition-all group-hover:bg-primary/20 z-0"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-8"> 
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Zeroly</span>
            </h2>
            <div className="text-foreground/90 leading-relaxed text-lg text-left space-y-6 bg-background/40 p-8 rounded-2xl backdrop-blur-md border border-border/50 shadow-sm">
              <p>
                <strong>Zeroly is a sustainable sharing platform that connects people who want to donate unused items with those who need them. Our goal is to reduce waste, promote reuse, and support a circular economy.
                We focus on local giving, encouraging communities to declutter responsibly, conserve resources, and strengthen social bonds.</strong>
              </p>
              <p>
                Every item shared on Zeroly helps create a greener, cleaner, and more connected world.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/50">
                <div>
                  <h4 className="font-bold text-primary text-xl mb-2 flex items-center gap-2">🌱 Item Listing</h4>
                  <p className="text-sm text-muted-foreground">List items you want to donate or view available listings from others in your area.</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-xl mb-2 flex items-center gap-2">🤝 Buy or Request</h4>
                  <p className="text-sm text-muted-foreground">Express interest in items or request to receive them directly through the platform.</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-xl mb-2 flex items-center gap-2">💬 Messaging & Reviews</h4>
                  <p className="text-sm text-muted-foreground">Contact item owners via in-app messaging or leave reviews after an exchange.</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-xl mb-2 flex items-center gap-2">🏆 Leaderboard</h4>
                  <p className="text-sm text-muted-foreground">A dynamic leaderboard highlights top contributors, encouraging active participation.</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-10">
              <Button asChild size="lg" className="font-bold text-base px-8 h-14 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                <Link to="/explore">Explore Items Now</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
