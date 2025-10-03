import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

// Définir les étapes
const STEPS = {
  PERSONAL_INFO: 1,
  LOCATION: 2,
  ID_UPLOAD: 3,
};

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(STEPS.PERSONAL_INFO);
  const [formData, setFormData] = useState({
    email: user?.email || '', // Récupérer l'email de l'utilisateur pour l'affichage
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '', // sera mappé à city_hall_name dans la DB pour le moment
    neighborhood: '',
    cityHallName: '',
  });
  const [identityCardFront, setIdentityCardFront] = useState<File | null>(null);
  const [identityCardBack, setIdentityCardBack] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      // Pré-remplir l'email si l'utilisateur est chargé
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email
      }));
      // Ici, une logique de récupération de profil existant serait ajoutée
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "Fichier trop volumineux",
          description: "La taille du fichier ne doit pas dépasser 5MB.",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Format invalide",
          description: "Veuillez sélectionner une image.",
        });
        return;
      }

      if (side === 'front') {
        setIdentityCardFront(file);
      } else {
        setIdentityCardBack(file);
      }
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('identity-cards')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  };

  const validateStep = (currentStep: number): boolean => {
    setError('');
    switch (currentStep) {
      case STEPS.PERSONAL_INFO:
        if (!formData.firstName || !formData.lastName || !formData.phone) {
          setError("Veuillez remplir tous les champs obligatoires de l'Étape 1.");
          return false;
        }
        break;
      case STEPS.LOCATION:
        if (!formData.city || !formData.neighborhood || !formData.address || !formData.cityHallName) {
          setError("Veuillez remplir tous les champs obligatoires de l'Étape 2.");
          return false;
        }
        break;
      case STEPS.ID_UPLOAD:
        if (!identityCardFront || !identityCardBack) {
          setError("Veuillez télécharger les deux faces de votre carte d'identité.");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateStep(STEPS.ID_UPLOAD)) return;

    setLoading(true);
    setError('');

    try {
      let frontUrl = '';
      let backUrl = '';

      // Upload identity card photos
      if (identityCardFront) {
        const frontPath = `${user.id}/identity-card-front-${Date.now()}.${identityCardFront.name.split('.').pop()}`;
        await uploadFile(identityCardFront, frontPath);

        const { data: frontData } = supabase.storage
          .from('identity-cards')
          .getPublicUrl(frontPath);
        frontUrl = frontData.publicUrl;
      }

      if (identityCardBack) {
        const backPath = `${user.id}/identity-card-back-${Date.now()}.${identityCardBack.name.split('.').pop()}`;
        await uploadFile(identityCardBack, backPath);

        const { data: backData } = supabase.storage
          .from('identity-cards')
          .getPublicUrl(backPath);
        backUrl = backData.publicUrl;
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          neighborhood: formData.neighborhood,
          city_hall_name: formData.city, 
          identity_card_front_url: frontUrl || null,
          identity_card_back_url: backUrl || null,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profil créé avec succès",
        description: "Votre profil a été configuré. Vous pouvez maintenant accéder aux services.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (side: 'front' | 'back') => {
    if (side === 'front') {
      setIdentityCardFront(null);
    } else {
      setIdentityCardBack(null);
    }
  };

  if (!user) return null;

  const currentStepTitle = {
    [STEPS.PERSONAL_INFO]: "1/3 : Informations Personnelles",
    [STEPS.LOCATION]: "2/3 : Adresse et Mairie",
    [STEPS.ID_UPLOAD]: "3/3 : Pièces d'identité",
  }[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Configuration du profil</CardTitle>
          <CardDescription>
            {currentStepTitle}
          </CardDescription>
          <div className="w-full mt-4">
            {/* Barre de progression style Google */}
            <div className="h-2 bg-muted rounded-full">
              <div 
                className="h-2 bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${(step / Object.keys(STEPS).length) * 100}%` }} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Étape 1: Informations Personnelles (Nom, Prénom, Téléphone, Email) */}
            {step === STEPS.PERSONAL_INFO && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="Votre prénom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Votre nom" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (pré-rempli) *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="+237 6XX XXX XXX" />
                </div>
              </div>
            )}

            {/* Étape 2: Localisation et Mairie (Ville, Quartier, Adresse, Mairie) */}
            {step === STEPS.LOCATION && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required placeholder="Ville de résidence" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Quartier *</Label>
                    <Input id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} required placeholder="Nom de votre quartier" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète (Rue, Numéro de parcelle) *</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Ex: 123 Rue de la République" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityHallName">Nom de la mairie du quartier *</Label>
                  <Input id="cityHallName" name="cityHallName" value={formData.cityHallName} onChange={handleInputChange} required placeholder="Mairie de..." />
                </div>
              </div>
            )}

            {/* Étape 3: Pièces d'identité (CNI) */}
            {step === STEPS.ID_UPLOAD && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Photos de la carte d'identité *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="front-upload" className="text-sm text-muted-foreground">
                      Recto de la carte d'identité
                    </Label>
                    {identityCardFront ? (
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <span className="text-sm truncate">{identityCardFront.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile('front')}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Label htmlFor="front-upload" className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:bg-accent/50">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Cliquer pour ajouter (Recto)</span>
                      </Label>
                    )}
                    <Input id="front-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="hidden" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="back-upload" className="text-sm text-muted-foreground">
                      Verso de la carte d'identité
                    </Label>
                    {identityCardBack ? (
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <span className="text-sm truncate">{identityCardBack.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile('back')}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Label htmlFor="back-upload" className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:bg-accent/50">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Cliquer pour ajouter (Verso)</span>
                      </Label>
                    )}
                    <Input id="back-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} className="hidden" />
                  </div>
                </div>
              </div>
            )}
            
            {/* Pied de carte avec boutons de navigation */}
            <div className="flex justify-between pt-4">
              {step > STEPS.PERSONAL_INFO ? (
                <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
              ) : (
                <div /> // Placeholder pour l'alignement du bouton Suivant
              )}

              {step < STEPS.ID_UPLOAD ? (
                <Button type="button" onClick={handleNext} disabled={loading}>
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finaliser et Soumettre le profil
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;