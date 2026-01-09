import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Ticket, Wallet, Gift, HelpCircle, Bell, User, ChevronRight, Sparkles, Trophy, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) fetchBalance();
  }, [user]);

  const fetchBalance = async () => {
    const { data } = await supabase.from('user_wallets').select('balance').eq('user_id', user?.id).single();
    if (data) setBalance(data.balance);
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF2F2]">
      <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
    </div>
  );

  const quickAccess = [
    { title: 'Acheter', icon: Ticket, path: '/tickets', color: 'bg-red-500' },
    { title: 'Mes gains', icon: Trophy, path: '/my-tickets', color: 'bg-orange-500' },
    { title: 'Banque', icon: Wallet, path: '/wallet', color: 'bg-red-600' },
    { title: 'Aide', icon: HelpCircle, path: '/support', color: 'bg-gray-800' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF2F2] pb-24 font-sans antialiased text-gray-900">
      
      {/* Header Style Apple */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-red-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
            <User size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Mon Compte</p>
            <h1 className="text-sm font-bold text-gray-900">{user.email?.split('@')[0]}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-gray-50 rounded-full text-gray-400 hover:text-red-600 transition-colors">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-8">
        
        {/* Solde - Carte Apple Card Red */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-600 to-red-700 rounded-[32px] p-8 text-white shadow-2xl shadow-red-200 relative overflow-hidden"
        >
          {/* Décoration animée */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-10 -top-10 opacity-10"
          >
            <Sparkles size={200} />
          </motion.div>

          <div className="relative z-10">
            <p className="text-red-100 text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Solde LotoPass</p>
            <div className="text-5xl font-black tracking-tighter mb-8">
              {balance !== null ? balance.toLocaleString() : '0'} <span className="text-2xl font-light opacity-60">FC</span>
            </div>
            
            <Button 
              onClick={() => navigate('/wallet')}
              className="w-full bg-white text-red-600 hover:bg-red-50 font-bold rounded-2xl h-14 shadow-inner"
            >
              <Plus className="mr-2 h-5 w-5" /> Ajouter des fonds
            </Button>
          </div>
        </motion.div>

        {/* Accès Rapide - Minimaliste */}
        <section className="grid grid-cols-4 gap-4">
          {quickAccess.map((item, i) => (
            <button 
              key={i} 
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`${item.color} w-14 h-14 rounded-[20px] flex items-center justify-center text-white shadow-lg group-active:scale-90 transition-all`}>
                <item.icon size={24} />
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{item.title}</span>
            </button>
          ))}
        </section>

        {/* Jeux Populaires - Listes épurées */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Jeux Populaires</h2>
            <Sparkles size={20} className="text-red-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            {[
              { title: 'Lotto Max', prize: '1,000,000', img: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=100&h=100&fit=crop', color: 'text-red-600' },
              { title: 'Roue Fortune', prize: '500,000', img: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=100&h=100&fit=crop', color: 'text-orange-500' }
            ].map((game, i) => (
              <motion.div 
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/tickets')}
                className="bg-white rounded-[24px] p-3 flex items-center gap-4 border border-red-50 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <img src={game.img} className="w-20 h-20 rounded-[18px] object-cover" alt="" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{game.title}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Jackpot</p>
                  <p className={`text-lg font-black ${game.color}`}>{game.prize} FC</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-full mr-2">
                  <ChevronRight size={20} className="text-gray-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bannière Promotionnelle Apple Style */}
        <section className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
            <Gift size={120} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-black mb-2">Bonus de Bienvenue</h3>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Doublez votre première recharge aujourd'hui. Offre limitée.
          </p>
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 font-bold">
            En profiter
          </Button>
        </section>

      </main>

      <footer className="text-center py-8">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">
          © 2025 LotoPass • Premium Gaminge
        </p>
      </footer>
    </div>
  );
};

export default Index;
