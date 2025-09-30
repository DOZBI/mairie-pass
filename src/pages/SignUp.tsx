import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, Phone, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simuler les services externes
const supabaseSignUp = (email: string, password: string, name: string) => {
  console.log(`Tentative d'inscription Supabase pour: ${email}`);
  return new Promise(resolve => setTimeout(() => resolve({ success: true, needsVerification: true }), 1500));
};

const supabaseSignIn = (email: string, password: string) => {
  console.log(`Tentative de connexion Supabase pour: ${email}`);
  return new Promise((resolve) => setTimeout(() => {
    resolve({ success: true }); 
  }, 1500));
};

const twilioVerification = (phone: string) => {
  console.log(`Tentative de vérification Twilio pour: ${phone}`);
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1500));
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
      
      const result: any = await supabaseSignIn(email, password);
      
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        navigate('/document-requests'); 
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
  
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullName = `${firstName} ${lastName}`;
    let result: any;

    try {
      if (contactMethod === 'email') {
        if (!email || !password) throw new Error("Veuillez fournir un email et un mot de passe.");
        result = await supabaseSignUp(email, password, fullName);
        
        if (result.success) {
          toast({
            title: "Validation requise",
            description: "Un lien de vérification a été envoyé à votre adresse email. Veuillez cliquer dessus pour activer votre compte.",
          });
          setIsLoginMode(true); 
          setPassword('');
          setLoading(false);
          return;
        } else {
          setError("Échec de l'inscription par email.");
        }

      } else {
        if (!phone) throw new Error("Veuillez fournir un numéro de téléphone.");
        result = await twilioVerification(phone);
        
        if (result.success) {
          toast({
            title: "Code envoyé",
            description: "Un code de vérification a été envoyé à votre numéro de téléphone. Veuillez le saisir.",
          });
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

  const renderSignUpContent = () => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-white p-6 pt-12 pb-10 text-center">
      
      <div className="w-full max-w-sm flex justify-start mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="text-green-600 p-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Retour
        </Button>
      </div>

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

          {(!isLoginMode || (isLoginMode && step === 2 && contactMethod === 'email')) && (
            <div className="pt-8 text-center">
                <p className="text-sm text-gray-600">
                    {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError('');
                            setStep(1);
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
