import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

/**
 * Identifiants de test (Mock)
 * Note: Dans la version finale, ces données proviendront de la validation sécurisée 
 * des comptes agents via Supabase[cite: 48, 70].
 */
const MOCK_CREDENTIALS = {
  username: 'Anthony',
  code: 'Anthony2298'
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulation d'un délai réseau pour l'expérience utilisateur
    await new Promise(resolve => setTimeout(resolve, 800));

    // Correction : .trim() supprime les espaces accidentels avant/après
    const cleanUsername = username.trim();
    const cleanCode = code.trim();

    if (cleanUsername === MOCK_CREDENTIALS.username && cleanCode === MOCK_CREDENTIALS.code) {
      // Stockage de la session locale [cite: 48]
      localStorage.setItem('adminSession', JSON.stringify({
        username: cleanUsername,
        loggedInAt: new Date().toISOString(),
        isAdmin: true
      }));
      
      toast.success('Accès autorisé au QG Numérique');
      navigate('/admin-panel');
    } else {
      toast.error('Identifiants incorrects (Vérifiez la casse)');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Bouton retour vers l'interface citoyen  */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-black transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Retour
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo Institutionnel [cite: 1, 5] */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" strokeWidth={1.5} />
          </div>
        </div>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 pb-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 italic">QG Numérique</h1>
            <p className="text-gray-400 text-sm font-medium mt-1">
              Administration de la Sécurité Civile [cite: 39]
            </p>
          </CardHeader>

          <CardContent className="p-8 pt-4">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Champ Identifiant */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                  Nom d'officier
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: Anthony"
                  className="h-12 border-gray-100 bg-gray-50/50 rounded-2xl focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all"
                  required
                />
              </div>

              {/* Champ Code Secret */}
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[11px] font-bold uppercase tracking-wider text-gray-400 ml-1">
                  Code d'accès
                </Label>
                <div className="relative">
                  <Input
                    id="code"
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 border-gray-100 bg-gray-50/50 rounded-2xl focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Bouton de connexion */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Accéder au Commandement"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer discret */}
        <p className="text-center mt-10 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
          République du Congo • Sécurité Civile [cite: 5]
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
