import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api.js";
import { toast } from "sonner";
import { Coins, ArrowUpRight, ArrowDownRight, CreditCard, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "http://localhost:5001/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PACKS = [
  { name: "Seedling Pack", seeds: 50, price: 5, inr: 500, highlight: false },
  { name: "Sprout Pack", seeds: 150, price: 12, inr: 1200, highlight: true },
  { name: "Canopy Pack", seeds: 500, price: 35, inr: 3500, highlight: false },
];

const WalletPage = () => {
  const { userInfo, setUserInfo } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`${API_BASE_URL}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack) => {
    setProcessingId(pack.name);
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setProcessingId(null);
      return;
    }

    try {
      // 1. Create order on backend
      const { data: order } = await api.post(
        `${API_BASE_URL}/wallet/create-order`,
        { amount: pack.inr, seeds: pack.seeds },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mock_key",
        amount: order.amount,
        currency: order.currency,
        name: "Zeroly EcoSeeds",
        description: `Purchase of ${pack.seeds} EcoSeeds`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const { data } = await api.post(
              `${API_BASE_URL}/wallet/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id || order.id,
                razorpay_payment_id: response.razorpay_payment_id || `mock_pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'mock_sig',
                seeds: pack.seeds,
              },
              { headers: { Authorization: `Bearer ${userInfo.token}` } }
            );

            toast.success(`Successfully purchased ${pack.seeds} EcoSeeds!`);
            
            // Update local user state & refresh transactions
            if (setUserInfo) {
                setUserInfo({ ...userInfo, points: data.newBalance });
            } else {
                userInfo.points = data.newBalance; 
            }
            fetchTransactions();
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
        },
        theme: {
          color: "#10b981", // emerald-500
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-background min-h-screen py-12 font-sans relative z-0">
      <div className="fixed inset-0 -z-10 h-full w-full bg-grid-pattern pointer-events-none opacity-40"></div>
      
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-extrabold text-foreground mb-8">EcoSeeds Wallet</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Balance Card */}
          <Card className="lg:col-span-1 bg-emerald-900/10 border-emerald-500/20 shadow-xl overflow-hidden relative">
            <div className="absolute -right-10 -top-10 text-emerald-500/10 pointer-events-none">
              <Coins className="w-48 h-48" />
            </div>
            <CardHeader>
              <CardTitle className="text-emerald-600 dark:text-emerald-400">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Coins className="w-10 h-10 text-emerald-500" />
                <span className="text-5xl font-black text-foreground">
                  {userInfo?.points || 0}
                </span>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                Earn EcoSeeds by giving away items, or purchase them below to request items you need.
              </p>
            </CardContent>
          </Card>

          {/* Pricing Tiers */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PACKS.map((pack) => (
              <Card key={pack.name} className={`relative flex flex-col ${pack.highlight ? 'border-primary shadow-primary/20 shadow-lg scale-105 z-10' : 'border-border'}`}>
                {pack.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{pack.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground block mt-2">${pack.price}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center flex-grow">
                  <div className="flex justify-center items-center gap-1 text-primary font-bold text-xl mb-4">
                    <Coins className="w-5 h-5" /> {pack.seeds} Seeds
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={pack.highlight ? "default" : "outline"}
                    onClick={() => handlePurchase(pack)}
                    disabled={processingId === pack.name}
                  >
                    {processingId === pack.name ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" /> Buy Now
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Ledger / History */}
        <h2 className="text-2xl font-bold text-foreground mb-6">Transaction History</h2>
        
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">Loading ledger...</div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No transactions yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((tx) => (
                  <div key={tx._id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        tx.type === 'earned' ? 'bg-emerald-500/10 text-emerald-500' :
                        tx.type === 'purchased' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {tx.type === 'earned' || tx.type === 'purchased' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-xl font-bold flex items-center gap-1 ${
                      tx.type === 'earned' || tx.type === 'purchased' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {tx.type === 'earned' || tx.type === 'purchased' ? '+' : '-'}{tx.amount}
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;
