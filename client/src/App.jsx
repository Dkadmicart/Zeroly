// client/src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";


import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop"; 
import { Toaster } from "@/components/ui/sonner";

import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import UploadPage from "./pages/UploadPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ItemDetailsPage from "./pages/ItemDetailsPage";
import RequestsDashboard from "./pages/RequestsDashboard";
import ChatPage from "./pages/ChatPage";
import FAQPage from "./pages/FAQPage"; 
import ContactPage from "./pages/ContactPage"; 
import LeaderboardPage from "./pages/LeaderboardPage"; 
import WalletPage from "./pages/WalletPage";


import { AuthProvider } from "./context/AuthContext"; 

function App() {
  console.log("API Base URL:", import.meta.env.VITE_API_URL);
  return (
    
    <div className="font-sans flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Header />

     
      <ScrollToTop />

      <main className="flex-grow pt-16">
        <Routes>
        
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />{" "}
         
          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/requests" element={<RequestsDashboard />} />
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/wallet" element={<WalletPage />} />
          </Route>
       
          <Route
            path="*"
            element={
              <h1 className="text-center text-3xl mt-20">
                404 - Page Not Found
              </h1>
            }
          />
        </Routes>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
