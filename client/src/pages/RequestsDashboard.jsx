import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5001/api";

const RequestsDashboard = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext);

  const fetchRequests = async () => {
    if (!userInfo) {
      setLoading(false); 
      return;
    }
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      
      const { data: sentData } = await api.get(`${API_BASE_URL}/requests/sent`, config); 
      const { data: receivedData } = await api.get(`${API_BASE_URL}/requests/received`, config);
      
      setSentRequests(sentData);
      setReceivedRequests(receivedData);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userInfo]); 

  const handleUpdateStatus = async (requestId, status) => {
    if (!userInfo) {
      toast.error("You must be logged in to update request status.");
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.put(`${API_BASE_URL}/requests/${requestId}`, { status }, config); 
      fetchRequests();
      toast.success(`Request ${status.toLowerCase()}!`); 
    } catch (error) {
      console.error("Failed to update request status:", error);
      toast.error(error.response?.data?.message || "Failed to update status. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-800">Accepted (Given)</span>;
      case "Declined":
        return <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wide border border-red-200 dark:border-red-800">Declined</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-200 dark:border-amber-800">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-center text-muted-foreground text-lg">Loading requests...</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <p className="text-xl text-foreground mb-6">Please log in to view your requests.</p>
            <Button asChild size="lg">
              <Link to="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Requests <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Manage items you are giving away and requesting.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Received Requests Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary border-b border-border pb-3">
                  Requests for Your Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {receivedRequests.length > 0 ? (
                  <ul className="space-y-4">
                    <AnimatePresence>
                      {receivedRequests.map((req) => (
                        <motion.li
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={req._id}
                          className="bg-background p-4 rounded-xl shadow-sm border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors"
                        >
                          <div className="flex-1">
                            {req.item ? (
                              <>
                                <p className="text-foreground font-medium mb-2">
                                  <span className="font-bold text-primary">{req.requester.name}</span> wants your{" "}
                                  <Link to={`/item/${req.item._id}`} className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors">
                                    {req.item.name}
                                  </Link>
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Status:</span>
                                  {getStatusBadge(req.status)}
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-muted-foreground italic mb-2">Item deleted.</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Status:</span>
                                  {getStatusBadge(req.status)}
                                </div>
                              </>
                            )}
                          </div>

                          {req.status === "Pending" && req.item && (
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(req._id, "Accepted")}
                                className="flex-1 sm:flex-none"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUpdateStatus(req._id, "Declined")}
                                className="flex-1 sm:flex-none"
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <div className="text-center py-10 bg-background rounded-xl border border-border border-dashed">
                    <p className="text-muted-foreground font-medium">No one has requested your items yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sent Requests Section */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-border bg-card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary border-b border-border pb-3">
                  Your Sent Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sentRequests.length > 0 ? (
                  <ul className="space-y-4">
                    <AnimatePresence>
                      {sentRequests.map((req) => (
                        <motion.li 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={req._id} 
                          className="bg-background p-4 rounded-xl shadow-sm border border-border transition-colors"
                        >
                          <div className="flex flex-col gap-2">
                            {req.item ? (
                              <p className="text-foreground font-medium">
                                You requested{" "}
                                <Link to={`/item/${req.item._id}`} className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors">
                                  {req.item.name}
                                </Link>{" "}
                                from <span className="font-bold text-primary">{req.owner.name}</span>
                              </p>
                            ) : (
                              <p className="text-muted-foreground italic">You requested an item that is no longer available.</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">Status:</span>
                              {getStatusBadge(req.status)}
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <div className="text-center py-10 bg-background rounded-xl border border-border border-dashed">
                    <p className="text-muted-foreground font-medium">You haven't requested any items.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default RequestsDashboard;
