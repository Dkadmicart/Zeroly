import React, { forwardRef } from "react"; 
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";

const Hero = forwardRef((props, ref) => { 
  // Framer motion variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <section
      ref={ref} 
      id="hero-section" 
      className="w-full min-h-[85vh] flex items-center justify-center relative overflow-hidden"
    >
      {/* Decorative background glow for a premium SaaS feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10 dark:bg-primary/10"></div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Top Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Join the sustainable sharing movement</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight mb-6"
          >
            Give things a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 drop-shadow-sm">second life.</span>
            <br className="hidden md:block" />
            First step to a greener planet.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
          >
            Zeroly is a smart, interactive platform for local reuse and sharing. 
            Connect with your community, declutter responsibly, and help reduce global waste.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          >
            <Button asChild size="lg" className="h-14 px-8 text-base rounded-full w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Link to="/upload" className="flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Start Giving
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base rounded-full w-full sm:w-auto bg-background/50 backdrop-blur-sm border-border hover:bg-accent transition-all">
              <Link to="/explore" className="flex items-center gap-2">
                Explore Items
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Abstract 3D-like / Floating elements for visual depth (pure CSS) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute hidden lg:block -left-20 top-20 w-72 h-72 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl pointer-events-none"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute hidden lg:block -right-20 bottom-10 w-96 h-96 bg-gradient-to-tr from-cyan-400/10 to-emerald-600/10 rounded-full blur-3xl pointer-events-none"
        ></motion.div>
      </div>
    </section>
  );
}); 

Hero.displayName = "Hero"; // Good practice for forwardRef components

export default Hero;