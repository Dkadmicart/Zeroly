import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircleQuestion, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FAQPage = () => {
  const faqs = [
    {
      question: "What is Zeroly's main mission?",
      answer: "Zeroly is a sustainable sharing platform where individuals can donate or request unused items. Our goal is to reduce landfill waste, promote the circular economy, and build stronger, more resourceful local communities.",
      value: "item-1"
    },
    {
      question: "How does the local exchange actually work?",
      answer: "It's simple: list an item you no longer need, or browse items listed by others. When you find something, request it through our built-in messaging system. You then arrange a safe, local meetup to exchange the item.",
      value: "item-2"
    },
    {
      question: "Can I request an item if I don't have anything to donate?",
      answer: "Absolutely! Zeroly is designed for both donors and recipients. You can browse and request items you need, even if you don't currently have anything to give away. The goal is to ensure items find a good home.",
      value: "item-3"
    },
    {
      question: "Is there any cost to use the platform?",
      answer: "No, Zeroly is completely free to use. All items listed on the platform must be offered for free. We do not allow the selling of items—only sharing and donating.",
      value: "item-4"
    },
    {
      question: "How does the Leaderboard system work?",
      answer: "The Leaderboard highlights the top contributors in our community. You earn points by actively participating—whether that's by donating items, fulfilling requests, or being an active member of the sharing ecosystem.",
      value: "item-5"
    },
    {
      question: "How do you ensure safety during exchanges?",
      answer: "We strongly recommend meeting in public, well-lit spaces (like a local cafe or public library) during daylight hours. Our messaging system allows you to coordinate safely without giving out your personal phone number.",
      value: "item-6"
    }
  ];

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
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-primary/10 rounded-2xl ring-1 ring-primary/20 backdrop-blur-sm">
            <MessageCircleQuestion className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Frequently Asked <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Questions
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Everything you need to know about sharing, requesting, and building a sustainable future with Zeroly.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-xl rounded-2xl relative overflow-hidden">
              <CardContent className="p-6 md:p-10">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.value} value={faq.value} className="border-b border-border/50 last:border-0">
                      <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary transition-colors py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground text-lg mb-6">
              Still have questions? We're here to help!
            </p>
            <Button asChild size="lg" className="h-12 px-8 font-bold group rounded-full">
              <Link to="/contact">
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;