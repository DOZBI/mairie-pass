import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, CreditCard, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Schema de validation pour l'inscription
const signUpSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().regex(/^(\+225|0)[0-9]{8,10}$/, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | null>(null);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleNextStep = async (data: SignUpForm) => {
    if (step === 1) {
      // Simulation de vérification Twilio
      setIsLoading(true);
      try {
        // Simuler l'envoi d'un SMS de vérification
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStep(2);
        toast({
          title: "Code de vérification envoyé",
          description: `Un code a été envoyé au ${data.phone}`,
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer le code de vérification",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      // Vérifier le code SMS
      if (phoneVerificationCode === "123456") { // Code de test
        setIsPhoneVerified(true);
        setStep(3);
        toast({
          title: "Téléphone vérifié",
          description: "Votre numéro de téléphone a été vérifié avec succès",
        });
      } else {
        toast({
          title: "Code incorrect",
          description: "Le code de vérification est incorrect",
          variant: "destructive",
        });
      }
    } else if (step === 3) {
      // Étape de paiement
      if (!paymentMethod) {
        toast({
          title: "Méthode de paiement requise",
          description: "Veuillez sélectionner une méthode de paiement",
          variant: "destructive",
        });
        return;
      }
      setStep(4);
    }
  };

  const handleSignUp = async (data: SignUpForm) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password);
      
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Créer le profil utilisateur
      const userData = await supabase.auth.getUser();
      if (userData.data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userData.data.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            email: data.email,
            neighborhood: '', 
            city_hall_name: ''
          });

        if (profileError) {
          console.error('Erreur lors de la création du profil:', profileError);
        }
      }

      toast({
        title: "Inscription réussie !",
        description: "Votre compte a été créé avec succès",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-4">
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step - 1)}
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {/* Logo/Icon circulaire avec icônes de documents */}
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-3 gap-1 p-2">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-3 h-3 border border-primary/30 rounded-sm" />
                  ))}
                </div>
              </div>
              <div className="relative z-10">
                {step === 1 && <Phone className="h-8 w-8 text-primary" />}
                {step === 2 && <Phone className="h-8 w-8 text-primary" />}
                {step === 3 && <CreditCard className="h-8 w-8 text-primary" />}
                {step === 4 && <Smartphone className="h-8 w-8 text-primary" />}
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl font-bold">
                {step === 1 && "Créer votre compte"}
                {step === 2 && "Vérifier votre téléphone"}
                {step === 3 && "Méthode de paiement"}
                {step === 4 && "Finaliser l'inscription"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Remplissez vos informations personnelles"}
                {step === 2 && "Saisissez le code reçu par SMS"}
                {step === 3 && "Choisissez votre méthode de paiement"}
                {step === 4 && "Confirmez votre inscription"}
              </CardDescription>
            </div>

            {/* Indicateur de progression */}
            <div className="flex space-x-2 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(step === 4 ? handleSignUp : handleNextStep)} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      placeholder="Votre prénom"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Votre nom"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="+225 01 23 45 67 89"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="votre@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                      placeholder="••••••"
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...form.register("confirmPassword")}
                      placeholder="••••••"
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Un code de vérification a été envoyé au {form.watch("phone")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code de vérification</Label>
                    <Input
                      id="code"
                      value={phoneVerificationCode}
                      onChange={(e) => setPhoneVerificationCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Code de test: 123456
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Choisissez votre méthode de paiement pour l'activation
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Card 
                      className={`cursor-pointer border-2 transition-colors ${
                        paymentMethod === 'mobile_money' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setPaymentMethod('mobile_money')}
                    >
                      <CardContent className="flex items-center p-4">
                        <Smartphone className="h-6 w-6 text-primary mr-3" />
                        <div className="flex-1">
                          <h4 className="font-medium">Mobile Money</h4>
                          <p className="text-sm text-muted-foreground">Orange Money, MTN Money, Moov Money</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">1 000 FCFA</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer border-2 transition-colors ${
                        paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CardContent className="flex items-center p-4">
                        <CreditCard className="h-6 w-6 text-primary mr-3" />
                        <div className="flex-1">
                          <h4 className="font-medium">Carte bancaire</h4>
                          <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">1 000 FCFA</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">Récapitulatif</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nom:</strong> {form.watch("firstName")} {form.watch("lastName")}</p>
                      <p><strong>Téléphone:</strong> {form.watch("phone")} ✓</p>
                      <p><strong>Email:</strong> {form.watch("email")}</p>
                      <p><strong>Paiement:</strong> {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Carte bancaire'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    En cliquant sur "Finaliser l'inscription", vous acceptez nos conditions d'utilisation
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || (step === 2 && !phoneVerificationCode) || (step === 3 && !paymentMethod)}
              >
                {isLoading ? "Chargement..." : 
                 step === 1 ? "Continuer" :
                 step === 2 ? "Vérifier" :
                 step === 3 ? "Continuer" :
                 "Finaliser l'inscription"}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate('/auth')}
                className="text-sm"
              >
                Déjà un compte ? Se connecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;