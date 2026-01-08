import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Menu, LogOut, Ticket, Gift, Wallet, Settings, HelpCircle, User } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

const MobileMenu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const menuItems = [
    { title: "Acheter Tickets", icon: <Ticket className="h-5 w-5" />, action: () => navigate("/tickets") },
    { title: "Mes Tickets", icon: <Gift className="h-5 w-5" />, action: () => navigate("/my-tickets") },
    { title: "Mon Portefeuille", icon: <Wallet className="h-5 w-5" />, action: () => navigate("/wallet") },
    ...(isAdmin
      ? [{ title: "Administration", icon: <Settings className="h-5 w-5" />, action: () => navigate("/admin") }]
      : []),
    { title: "Aide & Support", icon: <HelpCircle className="h-5 w-5" />, action: () => navigate("/support") },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-gray-800" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] bg-gray-800 border-l-0 text-white flex flex-col"
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gray-700 text-gray-400">
                <User size={24} />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user?.email?.split('@')[0]}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Nav Links */}
        <nav className="flex-grow px-4 py-6">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-base font-normal py-6 gap-4 hover:bg-gray-700"
              onClick={item.action}
            >
              {item.icon}
              {item.title}
            </Button>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-base font-normal py-6 gap-4 hover:bg-gray-700"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 text-red-400" />
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
