// src/pages/SignUp.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, Phone, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simuler les services externes
const supabaseSignUp = (email, password, name) => {
  console.log(`Tentative d'inscription Supabase pour: ${email}`);
  // Ici, vous appelleriez votre fonction Supabase.auth.signUp avec l'option 'redirectTo'
  // Supposons qu'ici la promesse simule l'inscription et l'envoi d'un lien de vérification.
  return new Promise(resolve => setTimeout(() => resolve({ success: true, needsVerification: true }), 1500));
};

const supabaseSignIn = (email, password) => {
  console.log(`Tentative de connexion Supabase pour: ${email}`);
  // Ici, vous appelleriez votre fonction Supabase (ex: supabase.auth.signIn)
  return new Promise((resolve, reject) => setTimeout(() => {
    // Simuler une connexion réussie
    resolve({ success: true }); 
    // Pour simuler un échec: reject(new Error("Identifiants incorrects"));
  }, 1500));
};

const twilioVerification = (phone) => {
  console.log(`Tentative de vérification Twilio pour: ${phone}`);
  // Ici, vous appelleriez votre fonction Twilio
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1500));
};


const SignUp = () => {
  // --- NOUVEL ÉTAT POUR GÉRER L'AFFICHAGE (Connexion ou Inscription) ---
  const [isLoginMode, setIsLoginMode] = useState(false); 
  // ---------------------------------------------------------------------

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour l'INSCRIPTION
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email'); 
  // États pour l'INSCRIPTION & la CONNEXION
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Logique de Navigation et de Soumission ---

  const handleNextStep = () => {
    setError('');

    if (step === 1) {
      if (!firstName || !lastName) {
        setError("Veuillez remplir votre nom et prénom.");
        return;
      }
      setStep(2); // Passage à l'étape des coordonnées
      return;
    }
  };

  const handleBack = () => {
    setError('');
    if (isLoginMode) {
      // Si on est en mode Connexion, on peut revenir à la page précédente
      navigate(-1);
    }
    else if (step === 2) {
      setStep(1);
    } else {
      // Retour à la page précédente ou à l'écran d'accueil
      navigate(-1); 
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
      
      const result = await supabaseSignIn(email, password);
      
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        // *** MODIFICATION : Redirection vers /document-requests ***
        navigate('/document-requests'); 
        // --------------------------------------------------------
      } else {
        setError("Identifiants incorrects ou échec de la connexion.");
      }

    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Erreur lors de la soumission.",
      });
    }

    setLoading(false);
  };
  
  // Fonction d'inscription existante (légèrement modifiée)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullName = `${firstName} ${lastName}`;
    let result;

    try {
      if (contactMethod === 'email') {
        if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
        result = await supabaseSignUp(email, password, fullName);
        
        if (result.success) {
          // *** MODIFICATION : Message pour la validation par email (Supabase) ***
          toast({
            title: "Validation requise",
            description: "Un lien de vérification a été envoyé à votre adresse email. Veuillez cliquer dessus pour activer votre compte.",
          });
          // ------------------------------------------------------------------------
          // Après l'inscription, on redirige vers une page d'attente/information,
          // ou on passe en mode connexion comme prévu par la logique précédente.
          setIsLoginMode(true); 
          setPassword('');
          setLoading(false);
          return;
        } else {
          setError("Échec de l'inscription par email.");
        }

      } else { // contactMethod === 'phone'
        if (!phone) throw new Error("Veuillez fournir un numéro de téléphone.");
        result = await twilioVerification(phone);
        
        if (result.success) {
          // *** Message pour la vérification par téléphone (Twilio) ***
          toast({
            title: "Code envoyé",
            description: "Un code de vérification a été envoyé à votre numéro de téléphone. Veuillez le saisir.",
          });
          // ------------------------------------------------------------
          // On redirige vers une page de vérification du code (à créer)
          navigate('/verify-code'); 
        } else {
          setError("Échec de l'envoi du code de vérification par téléphone.");
        }
      }

    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Erreur lors de la soumission.",
      });
    }

    setLoading(false);
  };

  // --- Rendu du Formulaire de CONNEXION (inchangé) ---
  const renderLoginForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <Button 
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-full text-base mt-6"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Se connecter
      </Button>
    </div>
  );

  // --- Rendu des Formulaires d'INSCRIPTION (inchangé) ---
  const renderSignUpContent = () => {
      // Contenu existant de renderStepContent()
      if (step === 1) {
          return (
              <div className="space-y-6">
                  <p className="text-gray-500">
                      Commencez par fournir votre identité.
                  </p>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                              id="firstName"
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Votre prénom"
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="lastName">Nom de famille</Label>
                          <Input
                              id="lastName"
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Votre nom"
                              required
                          />
                      </div>
                  </div>
              </div>
          );
      }

      if (step === 2) {
          return (
              <div className="space-y-6">
                  <p className="text-gray-500">
                      Choisissez comment vous souhaitez vous inscrire.
                  </p>

                  {/* Sélecteur de Méthode */}
                  <div className="flex w-full rounded-md bg-gray-100 p-1">
                      <button
                          type="button"
                          className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                              contactMethod === 'email' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                          }`}
                          onClick={() => setContactMethod('email')}
                      >
                          <Mail className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Email
                      </button>
                      <button
                          type="button"
                          className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                              contactMethod === 'phone' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                          }`}
                          onClick={() => setContactMethod('phone')}
                      >
                          <Phone className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Téléphone
                      </button>
                  </div>

                  {/* Formulaire Email (Supabase) */}
                  {contactMethod === 'email' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                  id="email"
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="votre@email.com"
                                  required
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="password">Mot de passe</Label>
                              <Input
                                  id="password"
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••"
                                  required
                              />
                          </div>
                      </div>
                  )}

                  {/* Formulaire Téléphone (Twilio) */}
                  {contactMethod === 'phone' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="phone">Numéro de Téléphone</Label>
                              <Input
                                  id="phone"
                                  type="tel"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="+33 6 12 34 56 78"
                                  required
                              />
                          </div>
                      </div>
                  )}
              </div>
          );
      }
  };


  // --- Rendu Principal ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white p-6 pt-12 pb-10 text-center">
      
      {/* Header avec bouton Retour */}
      <div className="w-full max-w-sm flex justify-start mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="text-green-600 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Retour
        </Button>
      </div>

      {/* Contenu Central : Titre et Formulaire */}
      <div className="w-full max-w-sm flex-grow px-4">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoginMode ? "Connectez-vous à votre compte" : (step === 1 ? "Vos informations" : "Vos coordonnées")}
          </h1>
          <p className="text-sm text-gray-600">
            {isLoginMode ? "Utilisez votre email et mot de passe." : `Étape ${step} sur 2`}
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={isLoginMode ? handleLoginSubmit : handleSignUpSubmit}>
          {isLoginMode ? renderLoginForm() : renderSignUpContent()}

          {/* Lien cliquable pour basculer entre les formulaires (uniquement en bas des formulaires email) */}
          {(!isLoginMode || (isLoginMode && step === 2 && contactMethod === 'email')) && (
            <div className="pt-8 text-center">
                <p className="text-sm text-gray-600">
                    {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError(''); // Effacer l'erreur lors du basculement
                            setStep(1); // Retourner à l'étape 1 si on revient à l'inscription
                        }}
                        className="text-green-600 font-semibold hover:text-green-700 ml-1 underline"
                    >
                        {isLoginMode ? "Créez-en un." : "Connectez-vous."}
                    </button>
                </p>
            </div>
          )}

        </form>

      </div>

      {/* Pied de Page : Bouton Principal (uniquement pour l'inscription multi-étape) */}
      {!isLoginMode && (
          <div className="w-full max-w-sm px-4 space-y-4">
              <Button 
                onClick={step === 1 ? handleNextStep : handleSignUpSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-full text-base"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 1 ? "Continuer" : (contactMethod === 'email' ? "S'inscrire" : "Vérifier le numéro")}
              </Button>
                {step === 2 && (
                    <p className="text-xs text-gray-500 mt-2">
                        En cliquant sur ce bouton, vous acceptez nos Conditions d'utilisation.
                    </p>
                )}
          </div>
      )}
    </div>
  );
};

export default SignUp;// src/pages/SignUp.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, Phone, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simuler les services externes
const supabaseSignUp = (email, password, name) => {
  console.log(`Tentative d'inscription Supabase pour: ${email}`);
  // Ici, vous appelleriez votre fonction Supabase.auth.signUp avec l'option 'redirectTo'
  // Supposons qu'ici la promesse simule l'inscription et l'envoi d'un lien de vérification.
  return new Promise(resolve => setTimeout(() => resolve({ success: true, needsVerification: true }), 1500));
};

const supabaseSignIn = (email, password) => {
  console.log(`Tentative de connexion Supabase pour: ${email}`);
  // Ici, vous appelleriez votre fonction Supabase (ex: supabase.auth.signIn)
  return new Promise((resolve, reject) => setTimeout(() => {
    // Simuler une connexion réussie
    resolve({ success: true }); 
    // Pour simuler un échec: reject(new Error("Identifiants incorrects"));
  }, 1500));
};

const twilioVerification = (phone) => {
  console.log(`Tentative de vérification Twilio pour: ${phone}`);
  // Ici, vous appelleriez votre fonction Twilio
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1500));
};


const SignUp = () => {
  // --- NOUVEL ÉTAT POUR GÉRER L'AFFICHAGE (Connexion ou Inscription) ---
  const [isLoginMode, setIsLoginMode] = useState(false); 
  // ---------------------------------------------------------------------

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour l'INSCRIPTION
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email'); 
  // États pour l'INSCRIPTION & la CONNEXION
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Logique de Navigation et de Soumission ---

  const handleNextStep = () => {
    setError('');

    if (step === 1) {
      if (!firstName || !lastName) {
        setError("Veuillez remplir votre nom et prénom.");
        return;
      }
      setStep(2); // Passage à l'étape des coordonnées
      return;
    }
  };

  const handleBack = () => {
    setError('');
    if (isLoginMode) {
      // Si on est en mode Connexion, on peut revenir à la page précédente
      navigate(-1);
    }
    else if (step === 2) {
      setStep(1);
    } else {
      // Retour à la page précédente ou à l'écran d'accueil
      navigate(-1); 
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
      
      const result = await supabaseSignIn(email, password);
      
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        // *** MODIFICATION : Redirection vers /document-requests ***
        navigate('/document-requests'); 
        // --------------------------------------------------------
      } else {
        setError("Identifiants incorrects ou échec de la connexion.");
      }

    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Erreur lors de la soumission.",
      });
    }

    setLoading(false);
  };
  
  // Fonction d'inscription existante (légèrement modifiée)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullName = `${firstName} ${lastName}`;
    let result;

    try {
      if (contactMethod === 'email') {
        if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
        result = await supabaseSignUp(email, password, fullName);
        
        if (result.success) {
          // *** MODIFICATION : Message pour la validation par email (Supabase) ***
          toast({
            title: "Validation requise",
            description: "Un lien de vérification a été envoyé à votre adresse email. Veuillez cliquer dessus pour activer votre compte.",
          });
          // ------------------------------------------------------------------------
          // Après l'inscription, on redirige vers une page d'attente/information,
          // ou on passe en mode connexion comme prévu par la logique précédente.
          setIsLoginMode(true); 
          setPassword('');
          setLoading(false);
          return;
        } else {
          setError("Échec de l'inscription par email.");
        }

      } else { // contactMethod === 'phone'
        if (!phone) throw new Error("Veuillez fournir un numéro de téléphone.");
        result = await twilioVerification(phone);
        
        if (result.success) {
          // *** Message pour la vérification par téléphone (Twilio) ***
          toast({
            title: "Code envoyé",
            description: "Un code de vérification a été envoyé à votre numéro de téléphone. Veuillez le saisir.",
          });
          // ------------------------------------------------------------
          // On redirige vers une page de vérification du code (à créer)
          navigate('/verify-code'); 
        } else {
          setError("Échec de l'envoi du code de vérification par téléphone.");
        }
      }

    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Erreur lors de la soumission.",
      });
    }

    setLoading(false);
  };

  // --- Rendu du Formulaire de CONNEXION (inchangé) ---
  const renderLoginForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <Button 
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-full text-base mt-6"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Se connecter
      </Button>
    </div>
  );

  // --- Rendu des Formulaires d'INSCRIPTION (inchangé) ---
  const renderSignUpContent = () => {
      // Contenu existant de renderStepContent()
      if (step === 1) {
          return (
              <div className="space-y-6">
                  <p className="text-gray-500">
                      Commencez par fournir votre identité.
                  </p>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                              id="firstName"
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Votre prénom"
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="lastName">Nom de famille</Label>
                          <Input
                              id="lastName"
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Votre nom"
                              required
                          />
                      </div>
                  </div>
              </div>
          );
      }

      if (step === 2) {
          return (
              <div className="space-y-6">
                  <p className="text-gray-500">
                      Choisissez comment vous souhaitez vous inscrire.
                  </p>

                  {/* Sélecteur de Méthode */}
                  <div className="flex w-full rounded-md bg-gray-100 p-1">
                      <button
                          type="button"
                          className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                              contactMethod === 'email' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                          }`}
                          onClick={() => setContactMethod('email')}
                      >
                          <Mail className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Email
                      </button>
                      <button
                          type="button"
                          className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                              contactMethod === 'phone' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                          }`}
                          onClick={() => setContactMethod('phone')}
                      >
                          <Phone className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Téléphone
                      </button>
                  </div>

                  {/* Formulaire Email (Supabase) */}
                  {contactMethod === 'email' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                  id="email"
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="votre@email.com"
                                  required
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="password">Mot de passe</Label>
                              <Input
                                  id="password"
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••"
                                  required
                              />
                          </div>
                      </div>
                  )}

                  {/* Formulaire Téléphone (Twilio) */}
                  {contactMethod === 'phone' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="phone">Numéro de Téléphone</Label>
                              <Input
                                  id="phone"
                                  type="tel"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="+33 6 12 34 56 78"
                                  required
                              />
                          </div>
                      </div>
                  )}
              </div>
          );
      }
  };


  // --- Rendu Principal ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white p-6 pt-12 pb-10 text-center">
      
      {/* Header avec bouton Retour */}
      <div className="w-full max-w-sm flex justify-start mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="text-green-600 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Retour
        </Button>
      </div>

      {/* Contenu Central : Titre et Formulaire */}
      <div className="w-full max-w-sm flex-grow px-4">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoginMode ? "Connectez-vous à votre compte" : (step === 1 ? "Vos informations" : "Vos coordonnées")}
          </h1>
          <p className="text-sm text-gray-600">
            {isLoginMode ? "Utilisez votre email et mot de passe." : `Étape ${step} sur 2`}
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={isLoginMode ? handleLoginSubmit : handleSignUpSubmit}>
          {isLoginMode ? renderLoginForm() : renderSignUpContent()}

          {/* Lien cliquable pour basculer entre les formulaires (uniquement en bas des formulaires email) */}
          {(!isLoginMode || (isLoginMode && step === 2 && contactMethod === 'email')) && (
            <div className="pt-8 text-center">
                <p className="text-sm text-gray-600">
                    {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError(''); // Effacer l'erreur lors du basculement
                            setStep(1); // Retourner à l'étape 1 si on revient à l'inscription
                        }}
                        className="text-green-600 font-semibold hover:text-green-700 ml-1 underline"
                    >
                        {isLoginMode ? "Créez-en un." : "Connectez-vous."}
                    </button>
                </p>
            </div>
          )}

        </form>

      </div>

      {/* Pied de Page : Bouton Principal (uniquement pour l'inscription multi-étape) */}
      {!isLoginMode && (
          <div className="w-full max-w-sm px-4 space-y-4">
              <Button 
                onClick={step === 1 ? handleNextStep : handleSignUpSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-full text-base"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 1 ? "Continuer" : (contactMethod === 'email' ? "S'inscrire" : "Vérifier le numéro")}
              </Button>
                {step === 2 && (
                    <p className="text-xs text-gray-500 mt-2">
                        En cliquant sur ce bouton, vous acceptez nos Conditions d'utilisation.
                    </p>
                )}
          </div>
      )}
    </div>
  );
};

export default SignUp;// src/pages/SignUp.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, Phone, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simuler les services externes
const supabaseSignUp = (email, password, name) => {
  console.log(`Tentative d'inscription Supabase pour: ${email}`);
  // Ici, vous appelleriez votre fonction Supabase.auth.signUp avec l'option 'redirectTo'
  // Supposons qu'ici la promesse simule l'inscription et l'envoi d'un lien de vérification.
  return new Promise(resolve => setTimeout(() => resolve({ success: true, needsVerification: true }), 1500));
};

const supabaseSignIn = (email, password) => {
  console.log(`Tentative de connexion Supabase pour: ${email}`);
  // Ici, vous appelleriez votre fonction Supabase (ex: supabase.auth.signIn)
  return new Promise((resolve, reject) => setTimeout(() => {
    // Simuler une connexion réussie
    resolve({ success: true }); 
    // Pour simuler un échec: reject(new Error("Identifiants incorrects"));
  }, 1500));
};

const twilioVerification = (phone) => {
  console.log(`Tentative de vérification Twilio pour: ${phone}`);
  // Ici, vous appelleriez votre fonction Twilio
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1500));
};


const SignUp = () => {
  // --- NOUVEL ÉTAT POUR GÉRER L'AFFICHAGE (Connexion ou Inscription) ---
  const [isLoginMode, setIsLoginMode] = useState(false); 
  // ---------------------------------------------------------------------

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour l'INSCRIPTION
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email'); 
  // États pour l'INSCRIPTION & la CONNEXION
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Logique de Navigation et de Soumission ---

  const handleNextStep = () => {
    setError('');

    if (step === 1) {
      if (!firstName || !lastName) {
        setError("Veuillez remplir votre nom et prénom.");
        return;
      }
      setStep(2); // Passage à l'étape des coordonnées
      return;
    }
  };

  const handleBack = () => {
    setError('');
    if (isLoginMode) {
      // Si on est en mode Connexion, on peut revenir à la page précédente
      navigate(-1);
    }
    else if (step === 2) {
      setStep(1);
    } else {
      // Retour à la page précédente ou à l'écran d'accueil
      navigate(-1); 
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
      
      const result = await supabaseSignIn(email, password);
      
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        // *** MODIFICATION : Redirection vers /document-requests ***
        navigate('/document-requests'); 
        // --------------------------------------------------------
      } else {
        setError("Identifiants incorrects ou échec de la connexion.");
      }

    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Erreur lors de la soumission.",
      });
    }

    setLoading(false);
  };
  
  // Fonction d'inscription existante (légèrement modifiée)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullName = `${firstName} ${lastName}`;
    let result;

    try {
      if (contactMethod === 'email') {
        if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
        result = await supabaseSignUp(email, password, fullName);
        
        if (result.success) {
          // *** MODIFICATION : Message pour la validation par email (Supabase) ***
          toast({
            title: "Validation requise",
            description: "Un lien de vérification a été envoyé à votre adresse email. Veuillez cliquer dessus pour activer votre compte.",
          });
          // ------------------------------------------------------------------------
          // Après l'inscription, on redirige vers une page d'attente/information,
          // ou on passe en mode connexion comme prévu par la logique précédente.
          setIsLoginMode(true); 
          setPassword('');
          setLoading(false);
          return;
        } else {
          setError("Échec de l'inscription par email.");
        }

      } else { // contactMethod === 'phone'
        if (!phone) throw new Error("Veuillez fournir un numéro de téléphone.");
        result = await twilioVerification(phone);
        
        if (result.success) {
          // *** Message pour la vérification par téléphone (Twilio) ***
          toast({
            title: "Code envoyé",
            description: "Un code de vérification a été envoyé à votre numéro de téléphone. Veuillez le saisir.",
          });
          // ------------------------------------------------------------
          // On redirige vers une page de vérification du code (à créer)
          navigate('/verify-code'); 
        } else {
          setError("Échec de l'envoi du code de vérification par téléphone.");
        }
      }

    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Erreur lors de la soumission.",
      });
    }

    setLoading(false);
  };

  // --- Rendu du Formulaire de CONNEXION (inchangé) ---
  const renderLoginForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Mot de passe</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <Button 
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-full text-base mt-6"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Se connecter
      </Button>
    </div>
  );

  // --- Rendu des Formulaires d'INSCRIPTION (inchangé) ---
  const renderSignUpContent = () => {
      // Contenu existant de renderStepContent()
      if (step === 1) {
          return (
              <div className="space-y-6">
                  <p className="text-gray-500">
                      Commencez par fournir votre identité.
                  </p>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input
                              id="firstName"
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Votre prénom"
                              required
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="lastName">Nom de famille</Label>
                          <Input
                              id="lastName"
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Votre nom"
                              required
                          />
                      </div>
                  </div>
              </div>
          );
      }

      if (step === 2) {
          return (
              <div className="space-y-6">
                  <p className="text-gray-500">
                      Choisissez comment vous souhaitez vous inscrire.
                  </p>

                  {/* Sélecteur de Méthode */}
                  <div className="flex w-full rounded-md bg-gray-100 p-1">
                      <button
                          type="button"
                          className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                              contactMethod === 'email' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                          }`}
                          onClick={() => setContactMethod('email')}
                      >
                          <Mail className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Email
                      </button>
                      <button
                          type="button"
                          className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                              contactMethod === 'phone' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
                          }`}
                          onClick={() => setContactMethod('phone')}
                      >
                          <Phone className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Téléphone
                      </button>
                  </div>

                  {/* Formulaire Email (Supabase) */}
                  {contactMethod === 'email' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                  id="email"
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="votre@email.com"
                                  required
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="password">Mot de passe</Label>
                              <Input
                                  id="password"
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••"
                                  required
                              />
                          </div>
                      </div>
                  )}

                  {/* Formulaire Téléphone (Twilio) */}
                  {contactMethod === 'phone' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="phone">Numéro de Téléphone</Label>
                              <Input
                                  id="phone"
                                  type="tel"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="+33 6 12 34 56 78"
                                  required
                              />
                          </div>
                      </div>
                  )}
              </div>
          );
      }
  };


  // --- Rendu Principal ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white p-6 pt-12 pb-10 text-center">
      
      {/* Header avec bouton Retour */}
      <div className="w-full max-w-sm flex justify-start mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="text-green-600 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Retour
        </Button>
      </div>

      {/* Contenu Central : Titre et Formulaire */}
      <div className="w-full max-w-sm flex-grow px-4">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoginMode ? "Connectez-vous à votre compte" : (step === 1 ? "Vos informations" : "Vos coordonnées")}
          </h1>
          <p className="text-sm text-gray-600">
            {isLoginMode ? "Utilisez votre email et mot de passe." : `Étape ${step} sur 2`}
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={isLoginMode ? handleLoginSubmit : handleSignUpSubmit}>
          {isLoginMode ? renderLoginForm() : renderSignUpContent()}

          {/* Lien cliquable pour basculer entre les formulaires (uniquement en bas des formulaires email) */}
          {(!isLoginMode || (isLoginMode && step === 2 && contactMethod === 'email')) && (
            <div className="pt-8 text-center">
                <p className="text-sm text-gray-600">
                    {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError(''); // Effacer l'erreur lors du basculement
                            setStep(1); // Retourner à l'étape 1 si on revient à l'inscription
                        }}
                        className="text-green-600 font-semibold hover:text-green-700 ml-1 underline"
                    >
                        {isLoginMode ? "Créez-en un." : "Connectez-vous."}
                    </button>
                </p>
            </div>
          )}

        </form>

      </div>

      {/* Pied de Page : Bouton Principal (uniquement pour l'inscription multi-étape) */}
      {!isLoginMode && (
          <div className="w-full max-w-sm px-4 space-y-4">
              <Button 
                onClick={step === 1 ? handleNextStep : handleSignUpSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-full text-base"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 1 ? "Continuer" : (contactMethod === 'email' ? "S'inscrire" : "Vérifier le numéro")}
              </Button>
                {step === 2 && (
                    <p className="text-xs text-gray-500 mt-2">
                        En cliquant sur ce bouton, vous acceptez nos Conditions d'utilisation.
                    </p>
                )}
          </div>
      )}
    </div>
  );
};

export default SignUp;
