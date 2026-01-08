import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Wallet, Gift, Settings, HelpCircle, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileMenu from '@/components/ui/mobile-menu';

const Index = () => {
  const { user, loading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    const { data } = await supabase
      .from('user_wallets')
      .select('balance')
      .eq('user_id', user?.id)
      .single();
    
    if (data) {
      setBalance(data.balance);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-gray-900 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-900 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const quickAccess = [
    { title: 'Acheter', icon: <Ticket size={28} />, action: () => navigate('/tickets') },
    { title: 'Mes jeux', icon: <Gift size={28} />, action: () => navigate('/my-tickets') },
    { title: 'Portefeuille', icon: <Wallet size={28} />, action: () => navigate('/wallet') },
    { title: 'Aide', icon: <HelpCircle size={28} />, action: () => navigate('/support') },
  ];

  const games = [
    { title: 'Lotto Max', cover: '/img/game-cover-1.png' },
    { title: 'Roue de la Fortune', cover: '/img/game-cover-2.png' },
    { title: 'Blackjack', cover: '/img/game-cover-3.png' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-white font-sans"
    >
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <header className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <User size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Bienvenue</p>
              <h1 className="font-bold text-lg">{user.email?.split('@')[0]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-800">
              <Bell size={22} />
            </Button>
            <MobileMenu />
          </div>
        </header>

        {/* Balance Card */}
        <Card className="my-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-blue-100">Solde actuel</p>
              <p className="text-4xl font-bold mt-1">
                {balance !== null ? `${balance.toFixed(2)} FC` : '...'}
              </p>
            </div>
            <Button className="bg-white/20 hover:bg-white/30 text-white rounded-xl">Recharger</Button>
          </div>
        </Card>

        {/* Quick Access */}
        <section className="my-6">
          <h2 className="font-semibold mb-3 text-lg">Accès Rapide</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickAccess.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 p-3 bg-gray-800 rounded-xl cursor-pointer"
                onClick={item.action}
              >
                {item.icon}
                <span className="text-xs">{item.title}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Games Section */}
        <section className="my-6">
          <h2 className="font-semibold mb-3 text-lg">Jeux</h2>
          <div className="grid grid-cols-1 gap-4">
            {games.map((game, index) => (
              <Card key={index} className="bg-gray-800 border-0 rounded-xl overflow-hidden">
                <img src={game.cover} alt={game.title} className="w-full h-32 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-semibold">{game.title}</h3>
                  <Button className="mt-3 w-full bg-gradient-to-r from-blue-500 to-purple-600">Jouer</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-gray-500">
          <p>&copy; 2024 Loto. Tous droits réservés.</p>
        </footer>
      </div>
    </motion.div>
  );
};

export default Index;
