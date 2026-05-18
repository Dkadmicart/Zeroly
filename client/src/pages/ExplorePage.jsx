import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ItemCard from "../components/ItemCard";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Sparkles, 
  Tv, 
  Sofa, 
  BookOpen, 
  Shirt, 
  Flame, 
  MoreHorizontal, 
  Search, 
  X, 
  History, 
  TrendingUp, 
  MapPin 
} from "lucide-react";

const API_BASE_URL = "http://localhost:5001/api";

const CATEGORIES_WITH_ICONS = [
  { name: "All", icon: Sparkles },
  { name: "Electronics", icon: Tv },
  { name: "Furniture", icon: Sofa },
  { name: "Books", icon: BookOpen },
  { name: "Clothing", icon: Shirt },
  { name: "Appliances", icon: Flame },
  { name: "Other", icon: MoreHorizontal },
];

const ExplorePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("All");
  const [radius, setRadius] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });
  
  const trendingSearches = ["Lab Coat", "Calculator", "Cycle", "Books", "Chair", "Laptop"];

  const addToRecentSearches = (searchWord) => {
    if (!searchWord.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(w => w.toLowerCase() !== searchWord.toLowerCase());
      const updated = [searchWord, ...filtered].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      const container = document.getElementById("search-input-container");
      if (container && !container.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await api.get(`${API_BASE_URL}/items?keyword=${keyword}`);
        if (data && data.items) {
          setSuggestions(data.items.slice(0, 5));
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  const getCoordinates = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          resolve(coords);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const fetchItems = async (lat = null, lng = null, pageNum = 1, append = false) => {
    if (append) setFetchingMore(true);
    else setLoading(true);
    
    try {
      let query = `?keyword=${keyword}&page=${pageNum}`;
      if (category !== "All") query += `&category=${category}`;
      
      const realRad = radius === "all" || !radius ? "" : radius;
      const realLat = lat || (userLocation ? userLocation.lat : null);
      const realLng = lng || (userLocation ? userLocation.lng : null);
      
      if (realRad && realLat && realLng) {
        query += `&radius=${realRad}&lat=${realLat}&lng=${realLng}`;
      }
      
      const { data } = await api.get(`${API_BASE_URL}/items${query}`);
      
      if (append) {
        setItems(prev => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      
      setPage(data.page);
      setPages(data.pages);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items. Please try refreshing the page.");
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchItems(null, null, 1, false);
  }, [category]); 

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setPage(1);
    addToRecentSearches(keyword);
    setShowDropdown(false);

    const realRad = radius === "all" || !radius ? "" : radius;
    if (realRad) {
      if (userLocation) {
        fetchItems(userLocation.lat, userLocation.lng, 1, false);
      } else {
        try {
          const coords = await getCoordinates();
          fetchItems(coords.lat, coords.lng, 1, false);
        } catch (err) {
          console.error("Error getting location", err);
          toast.error("Could not get your location for distance filtering. Please allow location access.");
          setRadius("all");
          fetchItems(null, null, 1, false);
        }
      }
    } else {
      fetchItems(null, null, 1, false);
    }
  };

  const handleRangeSearch = async (newRadius) => {
    setPage(1);
    const realRad = newRadius === "all" || !newRadius ? "" : newRadius;
    if (realRad) {
      if (userLocation) {
        fetchItems(userLocation.lat, userLocation.lng, 1, false);
      } else {
        try {
          const coords = await getCoordinates();
          fetchItems(coords.lat, coords.lng, 1, false);
        } catch (error) {
          console.error("Error getting location", error);
          toast.error("Could not get your location for distance filtering. Please allow location access.");
          setRadius("all");
          fetchItems(null, null, 1, false);
        }
      }
    } else {
      fetchItems(null, null, 1, false);
    }
  };

  const handleLoadMore = () => {
    if (page < pages) {
      const nextPage = page + 1;
      const realRad = radius === "all" || !radius ? "" : radius;
      if (realRad && userLocation) {
        fetchItems(userLocation.lat, userLocation.lng, nextPage, true);
      } else {
        fetchItems(null, null, nextPage, true);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!userInfo) {
      toast.error("You must be logged in to delete an item.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_BASE_URL}/items/${id}`, config);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.response?.data?.message || "You are not authorized to delete this item.");
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans transition-colors duration-300 relative z-0 pt-20">
      <div className="fixed inset-0 -z-10 h-full w-full bg-grid-pattern pointer-events-none"></div>

      <div className="container mx-auto p-4 py-8 md:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Explore <span className="gradient-text">Treasures</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Discover items nearby and help build a sustainable community.
          </p>
        </motion.div>

        {/* Search Bar - Glassmorphism UI */}
        <motion.div 
          id="search-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 max-w-4xl mx-auto border border-border/50 bg-card/50 backdrop-blur-xl p-6 rounded-2xl shadow-sm z-30 relative"
        >
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative" id="search-input-container">
              <Input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for treasures (e.g. calculator, books...)"
                className="w-full h-11 pr-10 focus-visible:ring-primary text-base"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Suggestions Panel */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-2 bg-popover border border-border/85 rounded-xl shadow-2xl z-50 p-4 overflow-hidden max-h-[400px] overflow-y-auto"
                  >
                    {/* Suggestions Section */}
                    {keyword && suggestions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-left">
                          Matching Treasures
                        </p>
                        <div className="space-y-2">
                          {suggestions.map((item) => (
                            <Link
                              to={`/item/${item._id}`}
                              key={item._id}
                              className="flex items-center gap-3 p-2 hover:bg-muted/60 rounded-lg transition-colors group text-left"
                            >
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={item.imageUrl || "/placeholder-item.png"}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {item.category} • {item.condition || "Good"}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {keyword && suggestions.length === 0 && (
                      <div className="py-6 text-center text-muted-foreground text-sm mb-2">
                        No immediate item matches. Press Enter to search everywhere.
                      </div>
                    )}

                    {/* Recent Searches Section */}
                    {!keyword && recentSearches.length > 0 && (
                      <div className="mb-4 text-left">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Recent Searches
                          </p>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-xs text-primary hover:underline font-semibold"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setKeyword(search);
                                fetchItems(null, null, 1, false);
                                setShowDropdown(false);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 hover:bg-muted text-xs text-foreground rounded-full transition-colors border border-border/30"
                            >
                              <History className="w-3 h-3 text-muted-foreground" />
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Searches Section */}
                    <div className="mb-1 text-left">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Popular Tags & Searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setKeyword(term);
                              fetchItems(null, null, 1, false);
                              setShowDropdown(false);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-xs text-primary font-semibold rounded-full transition-colors border border-primary/10"
                          >
                            <TrendingUp className="w-3 h-3" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="w-full md:w-[180px]">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES_WITH_ICONS.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[220px]">
              <Select value={radius} onValueChange={(val) => {
                setRadius(val);
                handleRangeSearch(val);
              }}>
                <SelectTrigger className="h-11">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <SelectValue placeholder="Distance Range" />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any distance</SelectItem>
                  <SelectItem value="5">Neighborhood (&lt; 5 km)</SelectItem>
                  <SelectItem value="15">City-wide (&lt; 15 km)</SelectItem>
                  <SelectItem value="50">Regional (&lt; 50 km)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" size="lg" className="h-11 px-8">
              Search
            </Button>
          </form>
        </motion.div>

        {/* Quick Category Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14 max-w-4xl mx-auto px-2">
          {CATEGORIES_WITH_ICONS.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = category === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setCategory(cat.name);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105"
                    : "bg-card/50 hover:bg-card border-border/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                <IconComponent className="w-4.5 h-4.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Item Listing */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-center text-muted-foreground text-lg">
              Discovering local treasures...
            </p>
          </div>
        ) : items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 border border-border bg-card p-8 rounded-2xl max-w-2xl mx-auto text-center shadow-sm"
          >
            <p className="text-foreground text-2xl font-bold mb-3">
              No treasures found here!
            </p>
            <p className="text-muted-foreground mb-8">
              Try adjusting your search criteria, increasing the radius, or be the first to list an item in this area.
            </p>
            <Button asChild size="lg">
              <Link to="/upload">List an Item</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12"
          >
            <AnimatePresence>
              {items.map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  userId={userInfo?._id}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && items.length > 0 && page < pages && (
          <div className="flex justify-center pb-12">
            <Button 
              onClick={handleLoadMore} 
              size="lg" 
              variant="outline"
              className="px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              disabled={fetchingMore}
            >
              {fetchingMore ? "Loading..." : "Load More Treasures"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
