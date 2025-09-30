
// src/pages/SignUp.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// --- Schémas de validation pour chaque étape ---
const step1Schema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  age: z.coerce.number().min(18, "Vous devez être majeur"),
});

const step2Schema = z.object({
  email: z.string().email("Email invalide"),
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  password: z.string().min(6, "Le mot de passe doit faire 6 caractères minimum"),
});

const step3Schema = z.object({
  city: z.string().min(2, "La ville est requise"),
  neighborhood: z.string().min(2, "Le quartier est requis"),
  street: z.string().min(3, "La rue est requise"),
  plotNumber: z.string().min(1, "Le numéro de parcelle est requis"),
});

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm({
    resolver: zodResolver(step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema),
  });

  const handleNextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      setStep(step + 1);
    }
  };

  const processForm = async (data: FieldValues) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (step < 3) {
      handleNextStep();
    } else {
      // --- Soumission finale ---
      setLoading(true);
      const { email, password, firstName, lastName, phone, neighborhood, city } = updatedData as any;

      const { error: signUpError, data: signUpData } = await signUp(email, password);

      if (signUpError || !signUpData.user) {
        toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description: signUpError?.message || "Une erreur est survenue.",
        });
        setLoading(false);
        return;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: signUpData.user.id,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          neighborhood: neighborhood,
          city_hall_name: city, // Utilisation du champ 'city_hall_name' pour la ville
          email: email
        });
        
      if (profileError) {
         toast({
          variant: "destructive",
          title: "Erreur de création du profil",
          description: profileError.message,
        });
        setLoading(false);
        return;
      }

      setStep(4); // Afficher l'écran de succès
      setLoading(false);
    }
  };
  
  // --- Composant pour la barre de progression ---
  const ProgressBar = ({ currentStep }: { currentStep: number }) => {
    const steps = [1, 2, 3];
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${currentStep > s ? 'bg-primary text-primary-foreground' : ''}
                ${currentStep === s ? 'bg-primary text-primary-foreground border-2 border-primary-foreground/50' : ''}
                ${currentStep < s ? 'bg-gray-200 text-gray-500' : ''}
              `}
            >
              {currentStep > s ? '✓' : s}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 transition-colors ${currentStep > s ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <header className="mb-8">
          <svg viewBox="0 0 350 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24">
            <path d="M50 80 C 100 20, 150 90, 200 60 S 280 0, 320 40" stroke="#3A4D39" strokeWidth="2" strokeDasharray="5 5"/>
            <path d="M225 35 L 235 25 M 225 35 L 235 45" stroke="#E86441" strokeWidth="3"/>
            <path d="M315 40 L 325 35 L 320 45 L 310 40 Z" fill="#3A4D39"/>
          </svg>
        </header>

        {step <= 3 && <ProgressBar currentStep={step} />}

        <form onSubmit={handleSubmit(processForm)} className="space-y-4">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-center">Inscription (1/3)</h1>
              <p className="text-center text-gray-500 text-sm mb-6">Informations personnelles</p>
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{`${errors.firstName.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{`${errors.lastName.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="age">Âge</Label>
                <Input id="age" type="number" {...register("age")} />
                {errors.age && <p className="text-red-500 text-xs mt-1">{`${errors.age.message}`}</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-center">Inscription (2/3)</h1>
              <p className="text-center text-gray-500 text-sm mb-6">Contact et sécurité</p>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                 {errors.email && <p className="text-red-500 text-xs mt-1">{`${errors.email.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone portable</Label>
                <Input id="phone" type="tel" {...register("phone")} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{`${errors.phone.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{`${errors.password.message}`}</p>}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-center">Inscription (3/3)</h1>
              <p className="text-center text-gray-500 text-sm mb-6">Adresse de résidence</p>
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input id="city" {...register("city")} />
                {errors.city && <p className="text-red-500 text-xs mt-1">{`${errors.city.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="neighborhood">Quartier</Label>
                <Input id="neighborhood" {...register("neighborhood")} />
                {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{`${errors.neighborhood.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="street">Rue</Label>
                <Input id="street" {...register("street")} />
                 {errors.street && <p className="text-red-500 text-xs mt-1">{`${errors.street.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="plotNumber">Numéro de parcelle</Label>
                <Input id="plotNumber" {...register("plotNumber")} />
                {errors.plotNumber && <p className="text-red-500 text-xs mt-1">{`${errors.plotNumber.message}`}</p>}
              </div>
            </>
          )}

          {step < 4 && (
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="w-full">
                  Précédent
                </Button>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 3 ? "S'inscrire" : "Continuer"}
              </Button>
            </div>
          )}

          {step === 4 && (
             <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Bonne chasse !</h1>
                <p className="text-gray-500 text-sm">
                  Vérifiez votre compte via le lien envoyé sur votre mail et profitez de nos jeux de piste.
                </p>
                <Button onClick={() => navigate('/auth')} className="w-full">
                  Se connecter
                </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignUp;
