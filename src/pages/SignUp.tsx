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
import { Loader2, CheckCircle2, User, Mail, MapPin } from 'lucide-react';

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
      setLoading(true);
      const { email, password, firstName, lastName, phone, neighborhood, city } = updatedData as any;

      const { error: signUpError, data: signUpData } = await signUp(email, password);

      if (signUpError || !signUpData?.user) {
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
          city_hall_name: city,
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

      setStep(4);
      setLoading(false);
    }
  };
  
  const ProgressBar = ({ currentStep }: { currentStep: number }) => {
    const steps = [1, 2, 3];
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, index) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                ${currentStep > s ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-110' : ''}
                ${currentStep === s ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white scale-110 shadow-lg' : ''}
                ${currentStep < s ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : ''}
              `}
            >
              {currentStep > s ? '✓' : s}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-20 h-1 transition-all duration-300 ${currentStep > s ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const stepIcons = [User, Mail, MapPin];
  const StepIcon = stepIcons[step - 1] || User;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 z-10 border border-white/20">
        {step <= 3 && (
          <>
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                <StepIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Inscription
              </h1>
            </div>
            <ProgressBar currentStep={step} />
          </>
        )}

        <form onSubmit={handleSubmit(processForm)} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
                Étape 1/3 - Informations personnelles
              </p>
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
                <Input id="firstName" {...register("firstName")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{`${errors.firstName.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
                <Input id="lastName" {...register("lastName")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{`${errors.lastName.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="age" className="text-sm font-medium">Âge</Label>
                <Input id="age" type="number" {...register("age")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                {errors.age && <p className="text-red-500 text-xs mt-1">{`${errors.age.message}`}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
                Étape 2/3 - Contact et sécurité
              </p>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input id="email" type="email" {...register("email")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                 {errors.email && <p className="text-red-500 text-xs mt-1">{`${errors.email.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Téléphone portable</Label>
                <Input id="phone" type="tel" {...register("phone")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{`${errors.phone.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <Input id="password" type="password" {...register("password")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{`${errors.password.message}`}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-6">
                Étape 3/3 - Adresse de résidence
              </p>
              <div>
                <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
                <Input id="city" {...register("city")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                {errors.city && <p className="text-red-500 text-xs mt-1">{`${errors.city.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="neighborhood" className="text-sm font-medium">Quartier</Label>
                <Input id="neighborhood" {...register("neighborhood")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{`${errors.neighborhood.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="street" className="text-sm font-medium">Rue</Label>
                <Input id="street" {...register("street")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                 {errors.street && <p className="text-red-500 text-xs mt-1">{`${errors.street.message}`}</p>}
              </div>
              <div>
                <Label htmlFor="plotNumber" className="text-sm font-medium">Numéro de parcelle</Label>
                <Input id="plotNumber" {...register("plotNumber")} className="border-2 focus:border-indigo-500 transition-colors mt-1" />
                {errors.plotNumber && <p className="text-red-500 text-xs mt-1">{`${errors.plotNumber.message}`}</p>}
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(step - 1)} 
                  className="w-full border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Précédent
                </Button>
              )}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={loading}
              >
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 3 ? "S'inscrire" : "Continuer"}
              </Button>
            </div>
          )}

          {step === 4 && (
             <div className="text-center space-y-6 animate-fade-in">
               <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-fit shadow-xl">
                 <CheckCircle2 className="h-16 w-16 text-white" />
               </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Inscription réussie !
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-base">
                  Vérifiez votre boîte mail pour activer votre compte et commencer à utiliser nos services.
                </p>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
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
