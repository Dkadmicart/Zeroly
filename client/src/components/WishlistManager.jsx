import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api.js';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, BellRing, Plus, Loader2 } from 'lucide-react';

const API_BASE_URL = "http://localhost:5001/api";

const WishlistManager = () => {
  const { userInfo } = useContext(AuthContext);
  const [keywords, setKeywords] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get(`${API_BASE_URL}/wishlists`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setKeywords(data.keywords || []);
        setIsActive(data.isActive !== false);
      } catch (error) {
        console.error('Failed to fetch wishlist', error);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo) fetchWishlist();
  }, [userInfo]);

  const saveWishlist = async (newKwds, newActive) => {
    setSaving(true);
    try {
      await api.put(`${API_BASE_URL}/wishlists`, { keywords: newKwds, isActive: newActive }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setKeywords(newKwds);
      setIsActive(newActive);
      toast.success("Wishlist updated");
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const word = newKeyword.toLowerCase().trim();
    if (keywords.includes(word)) {
      toast.error("Keyword already exists");
      return;
    }
    if (keywords.length >= 10) {
      toast.error("Maximum 10 keywords allowed");
      return;
    }
    const updated = [...keywords, word];
    saveWishlist(updated, isActive);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (word) => {
    const updated = keywords.filter(k => k !== word);
    saveWishlist(updated, isActive);
  };

  const toggleActive = () => {
    saveWishlist(keywords, !isActive);
  };

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary w-6 h-6" /></div>;

  return (
    <div className="bg-card/60 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <BellRing className="w-5 h-5 text-primary" />
          Smart Wishlist Alerts
        </h3>
        <Button 
          variant={isActive ? "default" : "outline"} 
          size="sm" 
          onClick={toggleActive}
          disabled={saving}
          className={isActive ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" : ""}
        >
          {isActive ? "Alerts Active" : "Alerts Paused"}
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Add keywords for items you are looking for (e.g., "bicycle", "winter coat"). 
        Our AI will automatically email you when a matching item is listed by anyone in the community!
      </p>

      <form onSubmit={handleAddKeyword} className="flex gap-2 mb-4">
        <Input 
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Add a keyword..."
          className="bg-background/50"
          maxLength={30}
        />
        <Button type="submit" disabled={saving || !newKeyword.trim()}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {keywords.length === 0 ? (
          <span className="text-sm text-muted-foreground italic">No keywords added yet.</span>
        ) : (
          keywords.map(kw => (
            <span key={kw} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 shadow-sm">
              {kw}
              <button 
                type="button" 
                onClick={() => handleRemoveKeyword(kw)}
                disabled={saving}
                className="hover:text-primary-foreground hover:bg-primary rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default WishlistManager;
