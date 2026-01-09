import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    const { error: signUpError, data: signUpData } = await signUp(email, password);

    if (signUpError || !signUpData?.user) {
      setError(signUpError?.message || "Échec de l'inscription.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        user_id: signUpData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: '',
        neighborhood: '',
        city_hall_name: '',
      }]);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    toast({
      title: "Inscription réussie",
      description: "Veuillez vérifier votre email pour activer votre compte.",
    });
    navigate('/auth');
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6"
    >
      <Card className="w-full max-w-sm bg-gray-800 border-0 shadow-lg rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Créer un compte</CardTitle>
          <CardDescription className="text-gray-400">
            Rejoignez-nous !
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex gap-4">
              <div className="space-y-2 w-1/2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Jean"
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white placeholder-gray-500 rounded-lg"
                />
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Dupont"
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white placeholder-gray-500 rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white placeholder-gray-500 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white placeholder-gray-500 rounded-lg"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/20 text-red-300 border-0">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-semibold rounded-lg"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "S'inscrire"}
            </Button>

            <div className="text-center text-sm text-gray-400">
              Déjà un compte ?{" "}
              <span
                onClick={() => navigate("/auth")}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Connectez-vous
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SignUp;
