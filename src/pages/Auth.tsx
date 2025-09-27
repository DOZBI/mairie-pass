import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Ajouté pour le choix Email/Téléphone

const Auth = () => {
  // Connexion (inchangé)
  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');

  // Inscription (nouveaux états)
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailSignUp, setEmailSignUp] = useState('');
  const [phone, setPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [passwordSignUp, setPasswordSignUp] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [street, setStreet] = useState('');
  const [parcelNumber, setParcelNumber] = useState('');

  // États généraux (inchangés)
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

  // --- Logique de Connexion (inchangée) ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(emailSignIn, passwordSignIn);

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

  // --- Logique d'Inscription (modifiée) ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Ici, vous devriez idéalement envoyer toutes les données collectées
    // (prénom, nom, email/téléphone, mot de passe, adresse) à votre fonction `signUp`.
    // J'utilise ici uniquement email et password, comme dans l'original,
    // mais vous devrez ajuster `useAuth` pour accepter toutes les infos.

    const finalEmail = contactMethod === 'email' ? emailSignUp : `temp-${Date.now()}@noemail.com`;
    const finalPassword = passwordSignUp;

    const { error } = await signUp(finalEmail, finalPassword, { // Hypotétique: envoi des métadonnées
      firstName,
      lastName,
      phone: contactMethod === 'phone' ? phone : undefined,
      city,
      district,
      street,
      parcelNumber,
    });

    if (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message,
      });
      setLoading(false);
    } else {
      toast({
        title: "Inscription réussie",
        description: "Veuillez vérifier votre email pour confirmer votre compte. Redirection vers la configuration du profil.",
      });
      // Redirection après succès
      navigate('/profile-setup');
    }

    setLoading(false);
  };

  // --- Logique de Navigation par Étapes ---
  const nextStep = () => {
    // Validation de l'étape 1
    if (currentStep === 1 && (!firstName || !lastName)) {
      setError("Veuillez remplir votre Prénom et Nom.");
      return;
    }

    // Validation de l'étape 2
    if (currentStep === 2) {
      if (contactMethod === 'email' && !emailSignUp) {
        setError("Veuillez saisir votre email.");
        return;
      }
      if (contactMethod === 'phone' && !phone) {
        setError("Veuillez saisir votre numéro de téléphone.");
        return;
      }
      if (!passwordSignUp || passwordSignUp.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
    }

    setError('');
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  // Définition du titre de l'étape
  const stepTitle = useMemo(() => {
    switch (currentStep) {
      case 1:
        return "Étape 1/3: Identité";
      case 2:
        return "Étape 2/3: Contact & Mot de passe";
      case 3:
        return "Étape 3/3: Localisation";
      default:
        return "Inscription";
    }
  }, [currentStep]);

  // --- Rendu des étapes ---

  const Step1 = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-lastname">Nom de famille</Label>
        <Input
          id="signup-lastname"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          placeholder="Dupont"
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
          placeholder="Jean"
        />
      </div>
    </div>
  );

  const Step2 = (
    <div className="space-y-4">
      <Label>Méthode de contact principale</Label>
      <RadioGroup
        defaultValue="email"
        value={contactMethod}
        onValueChange={(value: 'email' | 'phone') => {
          setContactMethod(value);
          setEmailSignUp('');
          setPhone('');
        }}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="email" id="contact-email" />
          <Label htmlFor="contact-email">Email</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="phone" id="contact-phone" />
          <Label htmlFor="contact-phone">Téléphone</Label>
        </div>
      </RadioGroup>

      {contactMethod === 'email' ? (
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            value={emailSignUp}
            onChange={(e) => setEmailSignUp(e.target.value)}
            required
            placeholder="votre@email.com"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="signup-phone">Téléphone</Label>
          <Input
            id="signup-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="+33 6 XX XX XX XX"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="signup-password">Mot de passe</Label>
        <Input
          id="signup-password"
          type="password"
          value={passwordSignUp}
          onChange={(e) => setPasswordSignUp(e.target.value)}
          required
          placeholder="••••••••"
          minLength={6}
        />
      </div>
    </div>
  );

  const Step3 = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-city">Ville</Label>
        <Input
          id="signup-city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          placeholder="Paris"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-district">Quartier</Label>
        <Input
          id="signup-district"
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          required
          placeholder="Saint-Germain"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-street">Rue/Avenue</Label>
          <Input
            id="signup-street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
            placeholder="Rue de Rivoli"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-parcel">N° Parcelle</Label>
          <Input
            id="signup-parcel"
            type="text"
            value={parcelNumber}
            onChange={(e) => setParcelNumber(e.target.value)}
            required
            placeholder="12 bis"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Mairie - Documents</CardTitle>
          <CardDescription>
            Connectez-vous ou inscrivez-vous pour accéder aux services d'état civil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            {/* --- Contenu Connexion (légèrement modifié pour les nouveaux états) --- */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={emailSignIn}
                    onChange={(e) => setEmailSignIn(e.target.value)}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Mot de passe</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={passwordSignIn}
                    onChange={(e) => setPasswordSignIn(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Se connecter
                </Button>
              </form>
            </TabsContent>

            {/* --- Contenu Inscription (Nouveau Formulaire Multi-étapes) --- */}
            <TabsContent value="signup">
              <CardDescription className="text-center mb-4 font-semibold text-primary">
                {stepTitle}
              </CardDescription>

              <form onSubmit={handleSignUp} className="space-y-4">
                {currentStep === 1 && Step1}
                {currentStep === 2 && Step2}
                {currentStep === 3 && Step3}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Boutons de Navigation */}
                <div className="flex justify-between pt-4">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep} disabled={loading} className="ml-auto">
                      Suivant <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" className="w-full ml-auto" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      S'inscrire
                    </Button>
                  )}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;