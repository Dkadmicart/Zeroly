import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MapPicker from "../components/MapPicker";
import api from "../api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, MapPin, AlignLeft, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const API_BASE_URL = "http://localhost:5001/api";

const CATEGORIES = ["Electronics", "Furniture", "Books", "Clothing", "Appliances", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const UploadPage = () => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Other",
    condition: "Good",
    ecoSeeds: 10,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.description)) {
      toast.error("Please fill in the item name and description.");
      return;
    }
    if (step === 2 && !image) {
      toast.error("Please upload an image of the item.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!location) {
      toast.error("Please select a location on the map.");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = "";

      if (image) {
        const { data: signData } = await api.get(`${API_BASE_URL}/upload/signature`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", image);
        cloudinaryFormData.append("api_key", signData.apiKey);
        cloudinaryFormData.append("timestamp", signData.timestamp);
        cloudinaryFormData.append("signature", signData.signature);
        cloudinaryFormData.append("folder", "zeroly");
        
        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          cloudinaryFormData
        );
        
        // Auto-optimize: WebP format, auto quality, max width 1200px to save bandwidth
        const rawUrl = cloudinaryRes.data.secure_url;
        imageUrl = rawUrl.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
      }

      const itemData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        location: [location.lng, location.lat],
        address: location.address || "",
        imageUrl: imageUrl,
        ecoSeeds: Number(formData.ecoSeeds),
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.post(`${API_BASE_URL}/items`, itemData, config);

      toast.success("Item successfully listed!");
      setTimeout(() => navigate(`/item/${data._id}`), 1500);
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "An error occurred during upload.");
      setUploading(false);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="bg-background min-h-screen py-12 font-sans relative z-0 overflow-hidden">
      <div className="fixed inset-0 -z-10 h-full w-full bg-grid-pattern pointer-events-none opacity-50"></div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header & Progress indicator */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">List an Item</h1>
            <p className="text-muted-foreground">Share your unused items with the community.</p>
          </div>

          <div className="flex justify-between items-center mb-8 relative max-w-md mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-border -z-10 -translate-y-1/2"></div>
            <div className={`absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= num ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-card text-muted-foreground border-2 border-border'}`}>
                {num === 1 && <AlignLeft className="w-5 h-5" />}
                {num === 2 && <Camera className="w-5 h-5" />}
                {num === 3 && <MapPin className="w-5 h-5" />}
              </div>
            ))}
          </div>

          {/* Wizard Card */}
          <Card className="shadow-2xl border-border/50 bg-card/60 backdrop-blur-xl relative overflow-hidden">
            {/* Step 1: Details */}
            <AnimatePresence mode="wait" custom={1}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Item Details</CardTitle>
                    <CardDescription>Tell the community what you are giving away.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Title</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Vintage Wooden Bookshelf"
                        className="bg-background/50 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ecoSeeds">EcoSeeds Cost</Label>
                      <Input
                        id="ecoSeeds"
                        name="ecoSeeds"
                        type="number"
                        min="0"
                        value={formData.ecoSeeds}
                        onChange={handleInputChange}
                        placeholder="e.g., 10"
                        className="bg-background/50 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Describe any flaws, age, size, or story behind the item..."
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={(val) => handleSelectChange("category", val)}>
                          <SelectTrigger className="h-12 bg-background/50">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select value={formData.condition} onValueChange={(val) => handleSelectChange("condition", val)}>
                          <SelectTrigger className="h-12 bg-background/50">
                            <SelectValue placeholder="Select Condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITIONS.map(cond => <SelectItem key={cond} value={cond}>{cond}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-4">
                    <Button onClick={nextStep} size="lg" className="shadow-lg shadow-primary/20">
                      Next Step <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Media */}
            <AnimatePresence mode="wait" custom={1}>
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Add a Photo</CardTitle>
                    <CardDescription>A good photo helps others see exactly what they are getting.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center w-full">
                      <Label htmlFor="image-upload" className="w-full cursor-pointer">
                        <div className={`w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${preview ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                          {preview ? (
                            <div className="relative w-full h-full p-2">
                              <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-background/80 transition-opacity rounded-lg">
                                <span className="font-semibold text-primary">Click to change image</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                              <Camera className="w-12 h-12 mb-4 text-primary opacity-50" />
                              <p className="font-semibold text-lg mb-1">Click to upload photo</p>
                              <p className="text-sm">JPG, PNG, WEBP (Max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </Label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={prevStep} size="lg">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={nextStep} size="lg" className="shadow-lg shadow-primary/20">
                      Next Step <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Location */}
            <AnimatePresence mode="wait" custom={1}>
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Pin Location</CardTitle>
                    <CardDescription>Where can people pick this up? Click on the map to place a pin.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-[350px] w-full rounded-xl overflow-hidden border border-border shadow-inner relative z-10">
                      <MapPicker onLocationSelect={setLocation} />
                    </div>
                    {location && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                        Location confirmed ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-4 pb-6">
                    <Button variant="ghost" onClick={prevStep} size="lg" disabled={uploading}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      size="lg" 
                      disabled={uploading}
                      className="shadow-lg shadow-primary/30 min-w-[150px] font-bold"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Listing...
                        </span>
                      ) : (
                        "Publish Listing"
                      )}
                    </Button>
                  </CardFooter>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;
