import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, Facebook, Github, Twitter } from "lucide-react";
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
        description: "Bienvenue sur votre espace MairiePass.",
      });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-950 text-white p-6 relative overflow-hidden"
    >
      {/* Arrière-plan lumineux */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-16 w-72 h-72 bg-green-500/20 rounded-full mix-blend-multiply blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-20 w-72 h-72 bg-green-400/20 rounded-full mix-blend-multiply blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Carte principale */}
      <Card className="w-full max-w-sm bg-black/50 border border-green-700/20 shadow-[0_0_35px_rgba(34,197,94,0.3)] backdrop-blur-md z-10 rounded-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center items-center w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-400/30 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <LogIn className="h-8 w-8 text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-400">Connexion</CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Accédez à votre espace citoyen
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="bg-transparent border border-green-500/30 focus:border-green-400 text-white placeholder-gray-500 rounded-full"
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
                className="bg-transparent border border-green-500/30 focus:border-green-400 text-white placeholder-gray-500 rounded-full"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border border-red-500/40 bg-red-950/20 text-red-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 mt-2 text-lg bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:shadow-[0_0_35px_rgba(34,197,94,0.8)] transition-all duration-300"
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin text-black" />}
              Se connecter
            </Button>

            <div className="text-center text-sm text-gray-400 mt-4">
              Pas encore de compte ?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-green-400 hover:underline cursor-pointer"
              >
                S’inscrire
              </span>
            </div>

            {/* Séparateur */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-green-800/40"></div>
              <span className="px-3 text-gray-500 text-xs uppercase">ou</span>
              <div className="flex-1 h-px bg-green-800/40"></div>
            </div>

            {/* Boutons sociaux */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="rounded-full border-green-500/40 text-green-400 hover:bg-green-500/20"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-green-500/40 text-green-400 hover:bg-green-500/20"
              >
                <Github className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-green-500/40 text-green-400 hover:bg-green-500/20"
              >
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Auth;
    
