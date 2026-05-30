

// client/src/components/Header.jsx

import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/Zerolylogo.png";
import { ModeToggle } from "./ModeToggle";
import { Coins, Wallet, User, LogOut, ChevronDown, Menu, X, Package } from "lucide-react";
import api from "../api.js";

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext) ?? {};
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!userInfo) {
      setPendingCount(0);
      return;
    }

    const fetchPendingCount = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data: receivedRequests } = await api.get("/api/requests/received", config);
        const count = receivedRequests.filter((req) => req.status === "Pending").length;
        setPendingCount(count);
      } catch (error) {
        console.error("Failed to fetch pending requests count in Header:", error);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [userInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
      navigate("/login");
    } else {
      console.warn("Logout function not found in AuthContext or not a function.");
      navigate("/login");
    }
  };

  const baseButtonClasses =
    "px-6 py-2 rounded-full font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105";
  const primaryButtonClasses = `${baseButtonClasses} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-600`;
  const secondaryButtonClasses = `${baseButtonClasses} bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-700`;
  const redButtonClasses = "px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]";
  const glassyNavButton = "px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 bg-secondary/50 hover:bg-secondary border border-border/50 shadow-sm backdrop-blur-md";

  const baseLinkClasses =
    "text-sm font-semibold transition-all duration-300 ease-in-out px-3 py-1.5 rounded-full hover:bg-secondary/50";
  const navLinkColors = "text-muted-foreground hover:text-foreground";
  const navLinkActive = "bg-secondary text-foreground shadow-sm border border-border/50";

  const initials = (userInfo && typeof userInfo.name === "string")
    ? userInfo.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    : "U";

  return (
    <header className="bg-background/70 backdrop-blur-xl border-b border-border/50 py-3 px-4 md:px-8 sticky top-0 z-50 font-sans shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/">
          <img src={logo} alt="Zeroly Logo" className="h-10" />
        </Link>

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
       
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseLinkClasses} ${navLinkColors} ${
                isActive ? navLinkActive : ""
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `${baseLinkClasses} ${navLinkColors} ${
                isActive ? navLinkActive : ""
              }`
            }
          >
            Explore
          </NavLink>

          
          {userInfo && (
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `${baseLinkClasses} ${navLinkColors} ${
                  isActive ? navLinkActive : ""
                }`
              }
            >
              Leaderboard
            </NavLink>
          )}

          {userInfo && (
            <NavLink
              to="/wallet"
              className={({ isActive }) =>
                `${baseLinkClasses} ${navLinkColors} ${
                  isActive ? navLinkActive : ""
                }`
              }
            >
              Wallet
            </NavLink>
          )}

          
          <Link
            to="/#about-us-section"
            className={`${baseLinkClasses} ${navLinkColors}`}
            onClick={(e) => {
              e.preventDefault(); 
              const section = document.querySelector("#about-us-section");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/#about-us-section");
              }
            }}
          >
            About
          </Link>

          <NavLink
            to="/faq"
            className={({ isActive }) =>
              `${baseLinkClasses} ${navLinkColors} ${
                isActive ? navLinkActive : ""
              }`
            }
          >
            FAQ
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `${baseLinkClasses} ${navLinkColors} ${
                isActive ? navLinkActive : ""
              }`
            }
          >
            Contact
          </NavLink>
        </nav>

      
        <div className="flex items-center space-x-3 md:space-x-4">
          <ModeToggle />
          
          {userInfo ? (
            <>
              <Link
                to="/wallet"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 backdrop-blur-md"
              >
                <Coins className="w-4 h-4" /> {userInfo.points || 0}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="relative flex items-center space-x-2 p-1.5 rounded-full hover:bg-secondary/80 border border-border/40 transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-inner relative">
                    {initials}
                    {pendingCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-background"></span>
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-semibold text-foreground max-w-[100px] truncate">
                    {userInfo.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-popover border border-border/80 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="px-3 py-2.5 mb-1.5 border-b border-border/40">
                      <p className="text-sm font-bold text-foreground truncate">{userInfo.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
                      
                      {/* Badge / Points info */}
                      <div className="flex items-center justify-between mt-2.5 px-2 py-1.5 rounded-xl bg-primary/5 border border-primary/10">
                        <span className="text-xs text-muted-foreground font-medium">Eco Balance:</span>
                        <span className="text-xs font-extrabold text-primary flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" /> {userInfo.points || 0}
                        </span>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      >
                        <User className="w-4 h-4 text-primary" />
                        My Profile
                      </Link>

                      <Link
                        to="/requests"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-emerald-500" />
                          <span>My Requests</span>
                        </div>
                        {pendingCount > 0 && (
                          <span className="flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full">
                            {pendingCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/wallet"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      >
                        <Wallet className="w-4 h-4 text-amber-500" />
                        My Wallet
                      </Link>
                    </div>

                    <div className="h-px bg-border/40 my-1.5" />

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link to="/login" className="px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105">
                Sign In / Join
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <button 
            onClick={toggleMobileMenu}
            className="relative text-foreground hover:text-emerald-600 focus:outline-none p-2 transition-colors duration-200"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <>
                <Menu className="w-7 h-7" />
                {pendingCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background"></span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top duration-300 mt-3">
          <div className="px-6 py-4 flex flex-col space-y-3">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `${baseLinkClasses} ${navLinkColors} justify-center text-center ${
                  isActive ? navLinkActive : ""
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/explore"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `${baseLinkClasses} ${navLinkColors} justify-center text-center ${
                  isActive ? navLinkActive : ""
                }`
              }
            >
              Explore
            </NavLink>

            {userInfo && (
              <>
                <NavLink
                  to="/leaderboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `${baseLinkClasses} ${navLinkColors} justify-center text-center ${
                      isActive ? navLinkActive : ""
                    }`
                  }
                >
                  Leaderboard
                </NavLink>

                <NavLink
                  to="/wallet"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `${baseLinkClasses} ${navLinkColors} justify-center text-center ${
                      isActive ? navLinkActive : ""
                    }`
                  }
                >
                  Wallet
                </NavLink>

                <NavLink
                  to="/requests"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `${baseLinkClasses} ${navLinkColors} flex items-center justify-center gap-2 ${
                      isActive ? navLinkActive : ""
                    }`
                  }
                >
                  <span>My Requests</span>
                  {pendingCount > 0 && (
                    <span className="flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `${baseLinkClasses} ${navLinkColors} justify-center text-center ${
                      isActive ? navLinkActive : ""
                    }`
                  }
                >
                  My Profile
                </NavLink>
              </>
            )}

            <Link
              to="/#about-us-section"
              className={`${baseLinkClasses} ${navLinkColors} text-center`}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                e.preventDefault(); 
                const section = document.querySelector("#about-us-section");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate("/#about-us-section");
                }
              }}
            >
              About
            </Link>

            <NavLink
              to="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `${baseLinkClasses} ${navLinkColors} justify-center text-center ${
                  isActive ? navLinkActive : ""
                }`
              }
            >
              FAQ
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `${baseLinkClasses} ${navLinkColors} justify-center text-center ${
                  isActive ? navLinkActive : ""
                }`
              }
            >
              Contact
            </NavLink>

            <div className="h-px bg-border/40 my-2" />

            {userInfo ? (
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Coins className="w-4 h-4" /> {userInfo.points || 0} EcoCoins
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className={`${redButtonClasses} w-full text-center`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
              >
                Sign In / Join
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
