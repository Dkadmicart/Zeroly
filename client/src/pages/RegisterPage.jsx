import React, { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Leaf, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../assets/Zerolylogo.png";

const API_BASE_URL = "http://localhost:5001/api";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const handleEmailBlur = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordBlur = () => {
    if (password && password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError || passwordError) {
      toast.error("Please fix the errors in the form first.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/users/register`, {
        name,
        email,
        password,
      });

      if (typeof login === "function") {
        login(data);
        toast.success("Registration successful! Welcome to Zeroly!");
        navigate("/");
      } else {
        console.warn("AuthContext login function is not available.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      let errorMessage = "Registration failed. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.status === 409) {
        errorMessage = "Registration failed. This email might already be in use.";
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
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>

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
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
            Join the movement. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Share your world.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Create an account today and start discovering treasures in your neighborhood, all while helping the environment.
          </p>
        </motion.div>

        <div className="relative z-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Zeroly Platform. All rights reserved.
        </div>
      </div>

      {/* Right Side - Register Form */}
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
              Create an account
            </h2>
            <p className="text-muted-foreground mb-8 text-center lg:text-left">
              Fill in your details to get started with Zeroly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="h-12 bg-background/50 focus:bg-background"
                />
              </div>

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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    onBlur={handlePasswordBlur}
                    required
                    placeholder="Create a strong password"
                    className={`h-12 bg-background/50 focus:bg-background pr-10 ${passwordError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                {passwordError && (
                  <p className="text-xs text-destructive mt-1 font-medium">{passwordError}</p>
                )}
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
                    Creating account...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Sign Up
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
                text="signup_with"
                context="signup"
              />
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline transition duration-200">
                Sign in here
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;