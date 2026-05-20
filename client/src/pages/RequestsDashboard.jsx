import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api.js";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, ScanLine, CheckCircle2, XCircle, Package, ArrowRight, Inbox } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

const API_BASE_URL = "http://localhost:5001/api";

const RequestsDashboard = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("received");

  const [showQrDialog, setShowQrDialog] = useState(false);
  const [selectedQrRequest, setSelectedQrRequest] = useState(null);

  const [showScannerDialog, setShowScannerDialog] = useState(false);
  const [selectedScannerRequest, setSelectedScannerRequest] = useState(null);

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

  const handleVerifyHandshake = async (scannedPayload) => {
    if (!selectedScannerRequest || !userInfo) return;
    
    if (scannedPayload !== selectedScannerRequest._id) {
      toast.error("Invalid QR Code! This QR code does not belong to this request.");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(`${API_BASE_URL}/requests/${scannedPayload}/verify`, {}, config);
      toast.success("Handshake successful! Item exchanged and points awarded.");
      setShowScannerDialog(false);
      setSelectedScannerRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Failed to verify handshake:", error);
      toast.error(error.response?.data?.message || "Failed to verify handshake. Try again.");
    }
  };

  useEffect(() => {
    let scanner = null;
    if (showScannerDialog) {
      scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText) => {
          if (scanner) {
            scanner.clear();
          }
          handleVerifyHandshake(decodedText);
        },
        (error) => {
          // Ignore frequent scan errors
        }
      );
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [showScannerDialog, selectedScannerRequest]);


  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return <span className="px-3 py-1.5 bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 rounded-full text-[11px] font-extrabold uppercase tracking-widest border border-emerald-200 dark:border-emerald-800/50 shadow-sm backdrop-blur-sm">Accepted (Awaiting Handshake)</span>;
      case "Completed":
        return <span className="px-3 py-1.5 bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 rounded-full text-[11px] font-extrabold uppercase tracking-widest border border-blue-200 dark:border-blue-800/50 flex items-center gap-1.5 shadow-sm backdrop-blur-sm w-fit"><CheckCircle2 className="w-3.5 h-3.5"/> Completed</span>;
      case "Declined":
        return <span className="px-3 py-1.5 bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded-full text-[11px] font-extrabold uppercase tracking-widest border border-red-200 dark:border-red-800/50 flex items-center gap-1.5 shadow-sm backdrop-blur-sm w-fit"><XCircle className="w-3.5 h-3.5"/> Declined</span>;
      default:
        return <span className="px-3 py-1.5 bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 rounded-full text-[11px] font-extrabold uppercase tracking-widest border border-amber-200 dark:border-amber-800/50 shadow-sm backdrop-blur-sm w-fit">Pending</span>;
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
      <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Requests <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Manage items you are giving away and requesting.</p>
        </motion.div>

        {/* Custom Segmented Control */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="bg-card/60 p-1.5 rounded-2xl inline-flex w-full md:w-auto shadow-sm border border-border/50 backdrop-blur-xl">
            <button 
              onClick={() => setActiveTab("received")} 
              className={`flex-1 md:w-56 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'received' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Inbox className="w-4 h-4" />
              For Your Items
              {receivedRequests.length > 0 && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{receivedRequests.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab("sent")} 
              className={`flex-1 md:w-56 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'sent' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Package className="w-4 h-4" />
              Your Sent Requests
              {sentRequests.length > 0 && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{sentRequests.length}</span>}
            </button>
          </div>
        </motion.div>

        <div className="relative">
          {/* Received Requests Tab */}
          <AnimatePresence mode="wait">
            {activeTab === "received" && (
              <motion.div 
                key="received"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {receivedRequests.length > 0 ? (
                  receivedRequests.map((req) => (
                    <motion.div
                      layout
                      key={req._id}
                      className="group bg-card/40 backdrop-blur-xl border border-border/40 hover:border-primary/30 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-5 items-start md:items-center relative overflow-hidden"
                    >
                      <div className="w-full h-40 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-muted/30 border border-border/30">
                        {req.item ? (
                          <img src={req.item.imageUrl || "/placeholder-item.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        {req.item ? (
                          <>
                            <h3 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                              <Link to={`/item/${req.item._id}`}>{req.item.name}</Link>
                            </h3>
                            <p className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                              Requested by <span className="text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{req.requester.name}</span>
                            </p>
                          </>
                        ) : (
                          <h3 className="text-xl font-bold text-muted-foreground line-clamp-1 mb-1">Item Deleted</h3>
                        )}
                        <div className="mt-4">
                          {getStatusBadge(req.status)}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
                        {req.status === "Pending" && req.item && (
                          <>
                            <Button size="default" onClick={() => handleUpdateStatus(req._id, "Accepted")} className="w-full sm:w-auto shadow-md">
                              Accept
                            </Button>
                            <Button size="default" variant="secondary" onClick={() => handleUpdateStatus(req._id, "Declined")} className="w-full sm:w-auto hover:bg-destructive hover:text-destructive-foreground">
                              Decline
                            </Button>
                          </>
                        )}
                        {req.status === "Accepted" && req.item && (
                          <Button size="default" onClick={() => { setSelectedScannerRequest(req); setShowScannerDialog(true); }} className="w-full sm:w-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            <ScanLine className="w-4.5 h-4.5" /> Scan QR Code
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-card/30 backdrop-blur-sm rounded-3xl border border-border/40 border-dashed">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4"><Inbox className="w-8 h-8 text-muted-foreground" /></div>
                    <p className="text-muted-foreground text-lg font-medium">No one has requested your items yet.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Sent Requests Tab */}
            {activeTab === "sent" && (
              <motion.div 
                key="sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {sentRequests.length > 0 ? (
                  sentRequests.map((req) => (
                    <motion.div
                      layout
                      key={req._id}
                      className="group bg-card/40 backdrop-blur-xl border border-border/40 hover:border-primary/30 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-5 items-start md:items-center relative overflow-hidden"
                    >
                      <div className="w-full h-40 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-muted/30 border border-border/30">
                        {req.item ? (
                          <img src={req.item.imageUrl || "/placeholder-item.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        {req.item ? (
                          <>
                            <h3 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                              <Link to={`/item/${req.item._id}`}>{req.item.name}</Link>
                            </h3>
                            <div className="text-muted-foreground text-sm font-medium flex items-center gap-1.5 flex-wrap">
                              <span className="flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5"/> Sent to</span>
                              <span className="text-foreground font-bold bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">{req.owner.name}</span>
                            </div>
                          </>
                        ) : (
                          <h3 className="text-xl font-bold text-muted-foreground line-clamp-1 mb-1">Item Deleted</h3>
                        )}
                        <div className="mt-4">
                          {getStatusBadge(req.status)}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto mt-2 md:mt-0">
                        {req.status === "Accepted" && req.item && (
                          <Button size="default" onClick={() => { setSelectedQrRequest(req); setShowQrDialog(true); }} className="w-full sm:w-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            <QrCode className="w-4.5 h-4.5" /> Show QR Code
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-card/30 backdrop-blur-sm rounded-3xl border border-border/40 border-dashed">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-muted-foreground" /></div>
                    <p className="text-muted-foreground text-lg font-medium">You haven't requested any items yet.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Code Show Dialog (For Requester) */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle>Handshake QR Code</DialogTitle>
            <DialogDescription>
              Show this QR code to the giver when you meet to exchange the item.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8 bg-white rounded-xl my-4 border border-border">
            {selectedQrRequest && (
              <QRCodeSVG 
                value={selectedQrRequest._id} 
                size={220} 
                level="H" 
                includeMargin={true}
                className="rounded-lg"
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Request ID: <span className="font-mono">{selectedQrRequest?._id}</span>
          </p>
        </DialogContent>
      </Dialog>

      {/* QR Code Scanner Dialog (For Owner/Giver) */}
      <Dialog open={showScannerDialog} onOpenChange={(open) => {
        if (!open) {
           setShowScannerDialog(false);
           setSelectedScannerRequest(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Handshake QR Code</DialogTitle>
            <DialogDescription>
              Scan the receiver's QR code to verify the handover and claim your 10 Karma Points!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div id="qr-reader" className="w-full rounded-xl overflow-hidden shadow-inner border border-border bg-black/5"></div>
          </div>

          <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary flex items-start gap-2">
            <ScanLine className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>Ensure the receiver has their "Show QR Code" screen open. The camera will automatically detect it.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsDashboard;
