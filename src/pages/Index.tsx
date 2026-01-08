import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Wallet, Gift, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileMenu from '@/components/ui/mobile-menu';

const Index = () => {
  const { user, loading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
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
      <div className="flex min-h-screen items-center justify-center bg-black text-green-400">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-green-900/20 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-green-900/20 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const services = [
    {
      title: 'Acheter Tickets',
      desc: 'Tentez votre chance',
      color: 'from-green-600/20 to-green-400/10',
      icon: <Ticket className="h-14 w-14 text-green-400" />,
      action: () => navigate('/tickets'),
    },
    {
      title: 'Mes Tickets',
      desc: 'Révéler & Historique',
      color: 'from-emerald-600/20 to-emerald-400/10',
      icon: <Gift className="h-14 w-14 text-emerald-400" />,
      action: () => navigate('/my-tickets'),
    },
    {
      title: 'Mon Portefeuille',
      desc: balance !== null ? `${balance.toFixed(2)} FC` : 'Chargement...',
      color: 'from-lime-600/20 to-lime-400/10',
      icon: <Wallet className="h-14 w-14 text-lime-400" />,
      action: () => navigate('/wallet'),
    },
    ...(isAdmin
      ? [
          {
            title: 'Administration',
            desc: 'Gestion',
            color: 'from-purple-600/20 to-purple-400/10',
            icon: <Settings className="h-14 w-14 text-purple-400" />,
            action: () => navigate('/admin'),
          },
        ]
      : []),
    {
      title: 'Aide & Support',
      desc: '24h/7j',
      color: 'from-gray-600/20 to-gray-400/10',
      icon: <HelpCircle className="h-14 w-14 text-gray-400" />,
      action: () => navigate('/support'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white"
    >
      <div className="max-w-md mx-auto py-10 px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-400">🎰 Tickets</h1>
            <p className="text-gray-400 text-sm">Tentez votre chance!</p>
          </div>
          <MobileMenu />
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 backdrop-blur-xl">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 text-sm mb-1">Votre solde</p>
            <p className="text-4xl font-bold text-white">
              {balance !== null ? `${balance.toFixed(2)} FC` : '...'}
            </p>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Card
                onClick={service.action}
                className={`overflow-hidden cursor-pointer border border-green-800/30 bg-black/50 backdrop-blur-xl rounded-3xl shadow-[0_0_25px_rgba(34,197,94,0.2)] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all duration-300`}
              >
                <div
                  className={`aspect-square bg-gradient-to-br ${service.color} flex items-center justify-center`}
                >
                  {service.icon}
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-sm mb-1 text-white">
                    {service.title}
                  </h3>
                  <p className="text-xs text-green-400">{service.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 mt-8 text-center text-gray-400 text-xs">
          Bienvenue, <span className="text-green-400">{user.email?.split('@')[0]}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
