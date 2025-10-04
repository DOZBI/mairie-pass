import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, Phone, Lock, User, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// --- Définition des animations framer-motion ---
const formVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const SignUp = () => {
  const [isLoginMode, setIsLoginMode] = useState(false); 
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email'); 
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();

  const handleNextStep = () => {
    setError('');

    if (step === 1) {
      if (!firstName || !lastName) {
        setError("Veuillez remplir votre nom et prénom.");
        return;
      }
      setStep(2);
      return;
    }
  };

  const handleBack = () => {
    setError('');
    if (isLoginMode) {
      navigate(-1);
    }
    else if (step === 2) {
      setStep(1);
    } else {
      navigate(-1); 
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
      
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message || "Identifiants incorrects ou échec de la connexion.");
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        navigate('/document-requests'); 
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
  
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (contactMethod === 'email') {
        if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
        
        const { error: signUpError, data: signUpData } = await signUp(email, password);
        
        if (signUpError || !signUpData?.user) {
          setError(signUpError?.message || "Échec de l'inscription par email.");
          setLoading(false);
          return;
        }

        // Créer le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            user_id: signUpData.user.id,
            first_name: firstName,
            last_name: lastName,
            phone: phone || '',
            email: email,
            city_hall_name: '',
            neighborhood: '',
            address: ''
          }]);
          
        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }

        toast({
          title: "Validation requise",
          description: "Un lien de vérification a été envoyé à votre adresse email. Veuillez cliquer dessus pour activer votre compte.",
        });
        navigate('/document-requests'); 

      } else {
        if (!phone) throw new Error("Veuillez fournir un numéro de téléphone.");
        
        // Pour le téléphone, on peut implémenter Twilio plus tard
        toast({
          title: "Fonctionnalité à venir",
          description: "L'inscription par téléphone sera bientôt disponible.",
        });
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
  
  // --- Composant de la Barre de Progression ---
  const ProgressBar = ({ currentStep }: { currentStep: number }) => {
    const steps = [
      { id: 1, label: 'Identité', icon: User },
      { id: 2, label: 'Contact', icon: Mail }
    ];
    return (
      <div className="flex w-full items-center justify-center mb-10">
        {steps.map((s, index) => (
          <div key={s.id} className={`flex items-center ${index < steps.length - 1 ? 'w-full' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${currentStep >= s.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {currentStep > s.id ? <CheckCircle size={20} /> : s.id}
            </div>
            <p className={`ml-3 font-semibold text-sm hidden sm:block transition-colors ${currentStep >= s.id ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</p>
            {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 transition-colors duration-300 ${currentStep > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
    );
  };
  
  // --- Rendu du Formulaire de Connexion ---
  const renderLoginForm = () => (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <Lock className="mx-auto text-green-500 mb-2" size={32}/>
        <h1 className="text-3xl font-bold text-gray-800">Connexion</h1>
        <p className="text-gray-500 mt-1">Accédez à votre compte.</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Mot de passe</Label>
          <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
      </div>
    </div>
  );

  // --- Rendu du Contenu d'Inscription ---
  const renderSignUpContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
              <div className="space-y-6">
                  <div className="text-center mb-8">
                    <User className="mx-auto text-green-500 mb-2" size={32}/>
                    <h1 className="text-3xl font-bold text-gray-800">Vos Informations</h1>
                    <p className="text-gray-500 mt-1">Qui êtes-vous ?</p>
                  </div>
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom" required />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="lastName">Nom de famille</Label>
                          <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Votre nom" required />
                      </div>
                  </div>
              </div>
          )}

          {step === 2 && (
              <div className="space-y-6">
                  <div className="text-center mb-8">
                    <Mail className="mx-auto text-green-500 mb-2" size={32}/>
                    <h1 className="text-3xl font-bold text-gray-800">Vos Coordonnées</h1>
                    <p className="text-gray-500 mt-1">Choisissez comment vous inscrire.</p>
                  </div>

                  <div className="flex w-full rounded-md bg-gray-100 p-1">
                      <button type="button" className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${contactMethod === 'email' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setContactMethod('email')}>
                          <Mail className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Email
                      </button>
                      <button type="button" className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${contactMethod === 'phone' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setContactMethod('phone')}>
                          <Phone className="h-4 w-4 mr-2 inline-block align-text-bottom" /> Téléphone
                      </button>
                  </div>

                  {contactMethod === 'email' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required/>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="password">Mot de passe</Label>
                              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required/>
                          </div>
                      </div>
                  )}

                  {contactMethod === 'phone' && (
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label htmlFor="phone">Numéro de Téléphone</Label>
                              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" required/>
                          </div>
                      </div>
                  )}
              </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 relative">
        
        {/* Bouton Retour */}
        <div className="absolute top-8 left-8">
            <Button variant="ghost" onClick={handleBack} className="p-0 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-1" /> Retour
            </Button>
        </div>

        {/* Barre de Progression (uniquement en mode Inscription) */}
        {!isLoginMode && <div className="mt-12 mb-8"><ProgressBar currentStep={step} /></div>}

        <AnimatePresence mode="wait">
          <motion.div
            key={isLoginMode ? 'login' : 'signup'}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            <form onSubmit={isLoginMode ? handleLoginSubmit : handleSignUpSubmit}>
              
              {/* Contenu du Formulaire */}
              <div className="flex-grow">
                {isLoginMode ? renderLoginForm() : renderSignUpContent()}
              </div>

              {/* Affichage des Erreurs */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Pied de page et Boutons */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                
                {/* Bouton Principal (Connexion / Continuer / S'inscrire) */}
                {isLoginMode ? (
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 h-12 rounded-lg" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Se connecter
                  </Button>
                ) : (
                  <Button type={step === 1 ? "button" : "submit"} onClick={step === 1 ? handleNextStep : undefined} className="w-full bg-green-500 hover:bg-green-600 h-12 rounded-lg" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {step === 1 ? "Continuer" : (contactMethod === 'email' ? "Créer mon compte" : "Vérifier le numéro")}
                  </Button>
                )}

                {/* Lien bascule Connexion/Inscription */}
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <button 
                        type="button" 
                        onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setStep(1); }} 
                        className="font-semibold text-green-500 hover:text-green-600 ml-1 underline"
                    >
                      {isLoginMode ? "Inscrivez-vous" : "Connectez-vous"}
                    </button>
                  </p>
                  {!isLoginMode && step === 2 && (
                    <p className="text-xs text-gray-500 mt-2">
                        En cliquant, vous acceptez nos Conditions d'utilisation.
                    </p>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignUp;
