import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Menu, LogOut, Ticket, Gift, Wallet, Settings, HelpCircle, User, Home } from "lucide-react";
import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MobileMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const quickActions = [
    { title: "Accueil", icon: <Home className="h-6 w-6" />, path: "/" },
    { title: "Tickets", icon: <Ticket className="h-6 w-6" />, path: "/tickets" },
    { title: "Portefeuille", icon: <Wallet className="h-6 w-6" />, path: "/wallet" },
  ];

  const menuItems = [
    { title: "Mes Tickets", icon: <Gift className="h-5 w-5" />, action: () => navigate("/my-tickets") },
    ...(isAdmin
      ? [{ title: "Administration", icon: <Settings className="h-5 w-5" />, action: () => navigate("/admin") }]
      : []),
    { title: "Aide & Support", icon: <HelpCircle className="h-5 w-5" />, action: () => navigate("/support") },
  ];

  return (
    /* Conteneur principal : Fond blanc très légèrement grisé, flou en arrière-plan */
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2">
        
        {/* Actions Rapides */}
        {quickActions.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
              location.pathname === item.path ? "text-blue-600 scale-105" : "text-gray-500"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.title}</span>
          </button>
        ))}

        {/* Bouton Plus */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-500 active:scale-95 transition-transform">
              <Menu className="h-6 w-6" />
              <span className="text-[10px] font-semibold">Plus</span>
            </button>
          </SheetTrigger>
          
          <SheetContent
            side="bottom"
            className="rounded-t-[24px] bg-slate-50 border-t-0 text-slate-900 p-0 shadow-2xl"
          >
            {/* Poignée de tirage */}
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-gray-300" />
            
            <div className="p-6">
              {/* Profil */}
              <div className="flex items-center gap-4 mb-8 p-2">
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <User size={28} />
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="font-bold text-lg leading-tight truncate text-slate-900">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-base font-medium py-7 gap-4 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                    onClick={() => item.action()}
                  >
                    <span className="text-blue-500 bg-blue-50 p-2 rounded-lg">{item.icon}</span>
                    {item.title}
                  </Button>
                ))}
                
                <Separator className="my-4 bg-gray-200" />
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-medium py-7 gap-4 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={handleSignOut}
                >
                  <span className="bg-red-50 p-2 rounded-lg"><LogOut className="h-5 w-5" /></span>
                  Déconnexion
                </Button>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileMenu;
