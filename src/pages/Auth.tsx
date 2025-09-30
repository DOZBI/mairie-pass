/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// --- 1. KEYFRAMES & STYLED COMPONENTS ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AnimatedCard = styled(Card)`
  animation: ${fadeIn} 0.5s ease-out;
  transition: box-shadow 0.3s ease-in-out;
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

// --- 2. COMPOSANT PRINCIPAL AUTH ---

const Auth = () => {
  // Connexion
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Inscription
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email'); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [signUpStep, setSignUpStep] = useState(1); // 1: Nom/Prénom, 2: Contact/Mot de passe

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirection après connexion réussie (si l'utilisateur est déjà chargé)
    if (user) {
      navigate('/MyRequests'); // Remplacez /dashboard par votre route de destination
    }
  }, [user, navigate]);

  // --- LOGIQUE DE CONNEXION (INCHANGÉE) ---

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
      navigate('/MyRequests');
    }
    
    setLoading(false);
  };
  
  // --- LOGIQUE D'INSCRIPTION EN 2 ÉTAPES ---

  const handleNextStep = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (signUpStep === 1) {
          if (!firstName || !lastName) {
              setError("Veuillez remplir votre nom et prénom.");
              return;
          }
          setSignUpStep(2);
      }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (contactType === 'email') {
        if (!email || !password) {
            setError("Veuillez fournir un email et un mot de passe.");
            setLoading(false);
            return;
        }

        const { error } = await signUp(email, password, { first_name: firstName, last_name: lastName });
        
        if (error) {
            setError(error.message);
            toast({ variant: "destructive", title: "Erreur d'inscription", description: error.message });
        } else {
            toast({
                title: "Inscription réussie",
                description: "Veuillez vérifier votre email pour confirmer votre compte.",
            });
            // Réinitialiser le formulaire et naviguer, ou passer en mode connexion pour l'utilisateur
            setLoading(false);
            setSignUpStep(1); 
            // Ici, vous pouvez rediriger vers la page de connexion ou afficher un message de succès
        }
    } else {
        // Logique pour l'inscription par téléphone (nécessiterait une API de vérification, simulée ici)
        if (!phoneNumber) {
            setError("Veuillez fournir un numéro de téléphone.");
            setLoading(false);
            return;
        }
        
        // Simuler l'envoi du code de vérification
        toast({
            title: "Code de vérification envoyé",
            description: `Un code a été envoyé au ${phoneNumber}.`,
        });
        // Naviguer vers une page de vérification de code
        navigate('/verify-phone'); 
    }
    
    setLoading(false);
  };
  
  // --- RENDU DES ÉTAPES D'INSCRIPTION ---

  const renderSignUpForm = () => {
      // Pour forcer une transition fondue entre les étapes 1 et 2
      const formKey = `signup-step-${signUpStep}`; 

      if (signUpStep === 1) {
          return (
              <form key={formKey} onSubmit={handleNextStep} className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Votre prénom" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="lastName">Nom de famille</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Votre nom" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                      Continuer
                  </Button>
              </form>
          );
      }
      
      if (signUpStep === 2) {
          return (
              <form key={formKey} onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="flex w-full rounded-md bg-gray-100 p-1 mb-4">
                      <button
                          type="button"
                          className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                              contactType === 'email' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                          }`}
                          onClick={() => setContactType('email')}
                      >
                          <Mail className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Email
                      </button>
                      <button
                          type="button"
                          className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                              contactType === 'phone' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                          }`}
                          onClick={() => setContactType('phone')}
                      >
                          <Phone className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Téléphone
                      </button>
                  </div>

                  {contactType === 'email' ? (
                      <>
                          <div className="space-y-2">
                              <Label htmlFor="signup-email">Email</Label>
                              <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="signup-password">Mot de passe</Label>
                              <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              S'inscrire
                          </Button>
                      </>
                  ) : (
                      <>
                          <div className="space-y-2">
                              <Label htmlFor="signup-phone">Numéro de Téléphone</Label>
                              <Input id="signup-phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required placeholder="+33 6 12 34 56 78" />
                          </div>
                          <Button type="submit" className="w-full" disabled={loading}>
                              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Vérifier par téléphone
                          </Button>
                      </>
                  )}
              </form>
          );
      }
  };


  // --- RENDU FINAL ---

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <AnimatedCard className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-primary">Mairie - Accès Citoyen</CardTitle>
          <CardDescription>
            {/* Affiche le statut de l'étape d'inscription */}
            {signUpStep === 1 && 'Commencez par vos informations personnelles.'}
            {signUpStep === 2 && 'Choisissez votre méthode de contact et mot de passe.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup" onClick={() => { setSignUpStep(1); setError(''); }}>Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Mot de passe</Label>
                  <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Se connecter
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
                {/* Bouton retour pour l'étape 2 */}
                {signUpStep === 2 && (
                    <Button 
                        variant="ghost" 
                        onClick={() => setSignUpStep(1)} 
                        className="text-primary p-0 mb-4 hover:bg-transparent"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Retour
                    </Button>
                )}
                
                {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

                {renderSignUpForm()}

            </TabsContent>
          </Tabs>
        </CardContent>
      </AnimatedCard>
    </div>
  );
};

export default Auth;
