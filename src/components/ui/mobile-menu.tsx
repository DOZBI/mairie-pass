import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Menu, LogOut, Ticket, Gift, Wallet, Settings, HelpCircle } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

const MobileMenu = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const menuItems = [
    { title: "Acheter Tickets", icon: <Ticket className="mr-3 h-5 w-5" />, action: () => navigate("/tickets") },
    { title: "Mes Tickets", icon: <Gift className="mr-3 h-5 w-5" />, action: () => navigate("/my-tickets") },
    { title: "Mon Portefeuille", icon: <Wallet className="mr-3 h-5 w-5" />, action: () => navigate("/wallet") },
    ...(isAdmin
      ? [{ title: "Administration", icon: <Settings className="mr-3 h-5 w-5" />, action: () => navigate("/admin") }]
      : []),
    { title: "Aide & Support", icon: <HelpCircle className="mr-3 h-5 w-5" />, action: () => navigate("/support") },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-green-400 hover:bg-green-600/10" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] border-r-green-500/20 bg-gray-900/95 text-white sm:w-[320px]"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-green-500/20 p-6">
            <h2 className="text-2xl font-bold text-green-400">Menu</h2>
          </div>

          {/* Nav Links */}
          <div className="flex-grow px-2 py-6">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start py-6 text-lg !text-white"
                onClick={item.action}
              >
                {item.icon}
                {item.title}
              </Button>
            ))}
          </div>

          {/* Footer / Logout */}
          <div className="border-t border-green-500/20 p-6">
            <Button
              variant="ghost"
              className="w-full justify-start py-6 text-lg !text-white"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
