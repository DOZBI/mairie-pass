import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Cover from "./pages/Cover";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import DocumentRequests from "./pages/DocumentRequests";
import MyRequests from "./pages/MyRequests";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";

const queryClient = new QueryClient();

const App = () => {
  const [showCover, setShowCover] = useState(true);

  useEffect(() => {
    const hasSeenCover = localStorage.getItem('hasSeenCover');
    if (hasSeenCover) {
      setShowCover(false);
    }
  }, []);

  const handleCoverComplete = () => {
    setShowCover(false);
  };

  if (showCover) {
    return <Cover onComplete={handleCoverComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/documents" element={<DocumentRequests />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
