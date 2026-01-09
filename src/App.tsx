import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MobileMenu from "@/components/MobileMenu";
import Index from "./pages/Index";
import Cover from "./pages/Cover";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Tickets from "./pages/Tickets";
import MyTickets from "./pages/MyTickets";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

// Composant intermédiaire pour gérer l'affichage conditionnel du menu
const AppContent = () => {
  const location = useLocation();
  
  // On ne cache le menu QUE sur la page Cover (chemin "/")
  const showMenu = location.pathname !== "/";

  return (
    <div className={`min-h-screen ${showMenu ? "pb-20" : ""}`}>
      <Routes>
        <Route path="/" element={<Cover />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Affichage conditionnel du menu mobile */}
      {showMenu && <MobileMenu />}
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          <AppContent />

        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
