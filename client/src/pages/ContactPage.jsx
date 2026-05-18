import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Thank you for your message! The Zeroly team will get back to you soon.", {
        icon: "✨"
      });
      setFormData({ name: "", email: "", message: "" });
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center py-20 px-4 md:px-8">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-primary/10 rounded-2xl ring-1 ring-primary/20 backdrop-blur-sm">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Let's Connect. Share. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Build a sustainable future with Zeroly
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Every shared item is a step toward a cleaner, greener world. Have questions? Let's turn opportunities into sustainable actions!
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start"
        >
          {/* Contact Info Card */}
          <motion.div variants={itemVariants} className="lg:col-span-2 h-full">
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-xl rounded-2xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="p-8 md:p-10 flex flex-col justify-between h-full relative z-10">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-8">Contact Information</h2>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email Support</h4>
                        <p className="text-base font-medium text-foreground">support@zeroly.com</p>
                        <p className="text-base font-medium text-foreground">hello@zeroly.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Call Us</h4>
                        <p className="text-base font-medium text-foreground">+1 (800) 123-4567</p>
                        <p className="text-sm text-muted-foreground mt-1">Mon-Fri from 9am to 6pm</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Headquarters</h4>
                        <p className="text-base font-medium text-foreground">
                          123 Eco-Valley Tech Park,<br />
                          Sustainability Block, NY 10012
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/50">
                  <p className="text-sm text-muted-foreground italic font-medium">
                    "Empowering communities through shared resources." 🌍
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-xl rounded-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-bl-full pointer-events-none" />
              <CardContent className="p-8 md:p-10 relative z-10">
                <h2 className="text-2xl font-bold text-foreground mb-2">Send us a Message</h2>
                <p className="text-muted-foreground mb-8">We'd love to hear from you. Fill out the form and we'll be in touch.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="h-12 bg-background/50 focus:bg-background"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12 bg-background/50 focus:bg-background"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help you make the world a greener place?"
                      value={formData.message}
                      onChange={handleChange}
                      className="min-h-[160px] bg-background/50 focus:bg-background resize-y"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto h-12 px-8 font-bold group"
                    disabled={loading}
                  >
                    {loading ? (
                      "Sending Message..."
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;