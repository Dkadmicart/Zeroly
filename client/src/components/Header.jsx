

// client/src/components/Header.jsx

import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/Zerolylogo.png";
import NotificationBtn from "./NotificationBtn";
import { ModeToggle } from "./ModeToggle";
import { Coins, Wallet, MessageCircle } from "lucide-react";

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext) ?? {};
  const navigate = useNavigate();

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
              <NotificationBtn />
              <Link
                to="/profile"
                className={glassyNavButton}
              >
                Profile
              </Link>

              <Link
                to="/requests"
                className={glassyNavButton}
              >
                My Requests
              </Link>

              <Link
                to="/messages"
                className="relative text-gray-600 hover:text-emerald-500 transition-colors p-2 rounded-full hover:bg-secondary/50 flex items-center justify-center"
              >
                <MessageCircle className="w-7 h-7" />
              </Link>

              <Link
                to="/wallet"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 backdrop-blur-md"
              >
                <Coins className="w-4 h-4" /> {userInfo.points || 0}
              </Link>

              <button onClick={handleLogout} className={redButtonClasses}>
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3 md:space-x-4">
              <Link to="/login" className="px-6 py-2 rounded-full font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white transition-all transform hover:scale-105">
                Sign In / Join
              </Link>
            </div>
          )}
        </div>

        
        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <button className="text-foreground hover:text-emerald-600 focus:outline-none p-2">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
