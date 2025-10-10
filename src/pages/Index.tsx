import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, Shield, LogOut, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
      title: 'Demander Document',
      desc: 'Payant',
      color: 'from-green-600/20 to-green-400/10',
      icon: <FileText className="h-14 w-14 text-green-400" />,
      action: () => navigate('/documents'),
    },
    {
      title: 'Mes Demandes',
      desc: 'Suivi',
      color: 'from-emerald-600/20 to-emerald-400/10',
      icon: <Users className="h-14 w-14 text-emerald-400" />,
      action: () => navigate('/my-requests'),
    },
    {
      title: 'Mon Profil',
      desc: 'Gérer',
      color: 'from-lime-600/20 to-lime-400/10',
      icon: <Shield className="h-14 w-14 text-lime-400" />,
      action: () => navigate('/profile'),
    },
    ...(isAdmin
      ? [
          {
            title: 'Administration',
            desc: 'Gestion',
            color: 'from-green-800/30 to-green-600/10',
            icon: <Settings className="h-14 w-14 text-green-500" />,
            action: () => navigate('/admin'),
          },
        ]
      : []),
    {
      title: 'Aide & Support',
      desc: '24h/7j',
      color: 'from-green-900/30 to-green-600/10',
      icon: <HelpCircle className="h-14 w-14 text-green-400" />,
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
          <h1 className="text-3xl font-bold text-green-400">Services</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-green-400 hover:bg-green-600/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Grille de services */}
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
              
