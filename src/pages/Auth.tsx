import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message,
      });
    } else {
      toast({
        title: "Connexion réussie 🎉",
        description: "Bienvenue sur votre espace.",
      });
      navigate("/dashboard");
    }
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
          <CardTitle className="text-3xl font-bold">Connexion</CardTitle>
          <CardDescription className="text-gray-400">
            Content de vous revoir !
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-6">
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
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Se connecter'}
            </Button>

            <div className="text-center text-sm text-gray-400">
              Pas de compte ?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Inscrivez-vous
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Auth;
