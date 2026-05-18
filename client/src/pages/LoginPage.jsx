import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, LogIn, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import logo from "../assets/Zerolylogo.png";

const API_BASE_URL = "http://localhost:5001/api"; 

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const { login } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const handleEmailBlur = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email");
      return;
    }
    
    setForgotPasswordLoading(true);
    setTimeout(() => {
      setForgotPasswordLoading(false);
      toast.success("Password reset link sent to your email!");
      setIsForgotModalOpen(false);
      setForgotPasswordEmail("");
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      toast.error("Please fix the errors in the form first.");
      return;
    }
    setLoading(true);
    
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users/login`, { 
        email,
        password,
      });

      if (typeof login === "function") {
        login(data);
        toast.success("Login successful! Welcome back!");
        navigate("/");
      } else {
        console.warn("AuthContext login function is not available.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background font-sans overflow-hidden">
      
      {/* Left Side - Branding / Graphic (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-primary/5 flex-col justify-between p-12 border-r border-border/50">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50"></div>
        
        {/* Abstract glowing blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          <Link to="/">
            <img src={logo} alt="Zeroly Logo" className="h-10 dark:invert" />
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-primary/20">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
            Welcome back to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">circular economy.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every time you log in, you are one step closer to making a positive impact on the environment. Connect, share, and reduce waste.
          </p>
        </motion.div>

        <div className="relative z-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Zeroly Platform. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8 relative">
          
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <img src={logo} alt="Zeroly Logo" className="h-12 dark:invert" />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-2 text-center lg:text-left">
              Sign in to your account
            </h2>
            <p className="text-muted-foreground mb-8 text-center lg:text-left">
              Enter your email and password below to log in.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onBlur={handleEmailBlur}
                  required
                  placeholder="name@example.com"
                  className={`h-12 bg-background/50 focus:bg-background ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {emailError && (
                  <p className="text-xs text-destructive mt-1 font-medium">{emailError}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Dialog open={isForgotModalOpen} onOpenChange={setIsForgotModalOpen}>
                    <DialogTrigger asChild>
                      <button type="button" className="text-sm font-medium text-primary hover:underline bg-transparent border-0 cursor-pointer p-0">
                        Forgot password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email Address</Label>
                          <Input
                            type="email"
                            id="reset-email"
                            placeholder="name@example.com"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                          />
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                          <Button
                            type="submit"
                            disabled={forgotPasswordLoading}
                            className="w-full sm:w-auto"
                          >
                            {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="h-12 bg-background/50 focus:bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    setLoading(true);
                    const { data } = await axios.post(`${API_BASE_URL}/users/google-login`, {
                      token: credentialResponse.credential,
                    });
            
                    if (typeof login === "function") {
                      login(data);
                      toast.success("Login successful! Welcome back!");
                      navigate("/");
                    }
                  } catch (error) {
                    console.error("Google login failed:", error);
                    toast.error(error.response?.data?.message || "Google login failed.");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  toast.error("Google login failed.");
                }}
                theme="filled_black"
                size="large"
                shape="pill"
                width="100%"
                text="signin_with"
                context="signin"
              />
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline transition duration-200">
                Create an account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
