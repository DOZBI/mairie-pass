import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Smartphone } from 'lucide-react'; // Ajout d'icônes
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  // Connexion state (step 1 login)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Inscription states (multi-step)
  const [step, setStep] = useState(1); // 1: Info perso, 2: Mot de passe
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState(''); // Email or Phone number
  const [contactType, setContactType] = useState('email'); // 'email' or 'phone'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Réinitialiser les erreurs et le chargement lors du changement de contactType
  useEffect(() => {
    setError('');
    setLoading(false);
  }, [step, contactType]);


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !contact) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinalSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // NOTE: Le AuthContext ne supporte que l'email et le mot de passe. 
    // Si l'utilisateur choisit le téléphone, nous utilisons le champ 'contact' comme 'email' pour l'appel `signUp` 
    // ou afficher une erreur si l'email est obligatoire.
    // Pour l'exemple, nous allons simuler l'envoi de l'email/contact pour l'inscription.
    let authIdentifier = contactType === 'email' ? contact : `phone_${contact}@example.com`; // Placeholder si AuthContext exige un email
    
    if (contactType === 'email' && !contact.includes('@')) {
        setError("Veuillez entrer une adresse email valide.");
        setLoading(false);
        return;
    }

    const { error } = await signUp(authIdentifier, password);
    
    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message,
      });
      setStep(1); // Revenir à l'étape 1 en cas d'erreur de contact/email
    } else {
      // Dans un vrai scénario, vous sauveriez firstName, lastName, contactType, etc. ici
      toast({
        title: "Inscription réussie",
        description: "Veuillez vérifier votre email pour confirmer votre compte. (ou SMS pour le téléphone)",
      });
      navigate('/profile-setup');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold text-green-700">Mairie - Documents</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder aux services d'état civil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            {/* Onglets stylisés en vert */}
            <TabsList className="grid w-full grid-cols-2 bg-green-100 dark:bg-green-900">
              <TabsTrigger 
                value="signin" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-semibold transition-colors"
              >
                Connexion
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                onClick={() => setStep(1)} // Retour à l'étape 1 lors du clic sur l'onglet Inscription
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-semibold transition-colors"
              >
                Inscription
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="pt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Mot de passe</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {/* Bouton de connexion en vert */}
                <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors" 
                    disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Se connecter
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="pt-4">
              {/* Étape 1: Infos personnelles et contact */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="signup-lastname">Nom</Label>
                        <Input
                            id="signup-lastname"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            placeholder="Votre nom"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="signup-firstname">Prénom</Label>
                        <Input
                            id="signup-firstname"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="Votre prénom"
                        />
                    </div>
                    
                    {/* Sélecteur Email/Téléphone */}
                    <div className="flex space-x-2">
                        <Button 
                            type="button" 
                            onClick={() => setContactType('email')}
                            className={`flex-1 ${contactType === 'email' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            <Mail className="mr-2 h-4 w-4" /> Email
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => setContactType('phone')}
                            className={`flex-1 ${contactType === 'phone' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            <Smartphone className="mr-2 h-4 w-4" /> Téléphone
                        </Button>
                    </div>

                    {/* Champ de Contact (Email ou Téléphone) */}
                    <div className="space-y-2">
                        <Label htmlFor="signup-contact">
                            {contactType === 'email' ? 'Adresse Email' : 'Numéro de téléphone'}
                        </Label>
                        <Input
                            id="signup-contact"
                            type={contactType === 'email' ? 'email' : 'tel'}
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            required
                            placeholder={contactType === 'email' ? 'votre@email.com' : '06 00 00 00 00'}
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {/* Bouton Continuer en vert */}
                    <Button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors" 
                        disabled={loading}
                    >
                        Continuer
                    </Button>
                    
                    <div className="text-center text-sm mt-4">
                        Déjà un compte?{' '}
                        {/* Lien Connectez-vous en vert */}
                        <Button 
                            type="button" 
                            variant="link" 
                            // Mécanisme pour basculer vers l'onglet 'signin'
                            onClick={() => {
                                const signinTab = document.querySelector('button[data-state="signin"]') as HTMLElement;
                                if(signinTab) signinTab.click();
                            }}
                            className="text-green-600 p-0 h-auto"
                        >
                            Connectez-vous
                        </Button>
                    </div>
                </form>
              )}

              {/* Étape 2: Mot de passe */}
              {step === 2 && (
                <form onSubmit={handleFinalSignUp} className="space-y-4">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-green-600">Étape 2: Mot de passe</h3>
                        <p className="text-sm text-muted-foreground">
                            Création du mot de passe pour **{contact}**
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="signup-password">Mot de passe</Label>
                        <Input
                            id="signup-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    
                    {/* Un champ de confirmation serait idéal ici en production */}
                    
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="w-full text-green-600 border-green-600 hover:bg-green-50"
                        disabled={loading}
                    >
                        Retour
                    </Button>
                    {/* Bouton S'inscrire final en vert */}
                    <Button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors" 
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        S'inscrire
                    </Button>
                    
                    <div className="text-center text-sm mt-4">
                        Déjà un compte?{' '}
                        {/* Lien Connectez-vous en vert */}
                        <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => {
                                const signinTab = document.querySelector('button[data-state="signin"]') as HTMLElement;
                                if(signinTab) signinTab.click();
                            }}
                            className="text-green-600 p-0 h-auto"
                        >
                            Connectez-vous
                        </Button>
                    </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
