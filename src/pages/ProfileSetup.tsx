import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfileSetup = () => {
  const location = useLocation();
  // Récupération du téléphone pré-rempli depuis la page d'inscription
  const initialPhone = (location.state as { initialPhone?: string })?.initialPhone || '';

  const [formData, setFormData] = useState({
    phone: initialPhone, // Initialisation avec le téléphone
    firstName: '',
    lastName: '',
    address: '', // NOUVEAU CHAMP: Adresse
    city: '', // NOUVEAU CHAMP: Ville (sera mappé à city_hall_name dans la DB pour le moment)
    neighborhood: '',
    cityHallName: '', // Mairie du quartier (Champ distinct pour la clarté)
  });
  const [identityCardFront, setIdentityCardFront] = useState<File | null>(null);
  const [identityCardBack, setIdentityCardBack] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!identityCardFront || !identityCardBack) {
      setError("Veuillez télécharger les deux faces de votre carte d'identité.");
      return;
    }


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
          address: formData.address, // MISE À JOUR: Enregistrement de l'adresse
          neighborhood: formData.neighborhood,
          city_hall_name: formData.city, // MISE À JOUR: Mappage du champ 'city' vers 'city_hall_name' DB
          identity_card_front_url: frontUrl || null,
          identity_card_back_url: backUrl || null,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profil créé avec succès",
        description: "Votre profil a été configuré. Vous pouvez maintenant accéder aux services.",
      });

      navigate('/dashboard'); // Redirection vers le dashboard après configuration
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Configuration du profil</CardTitle>
          <CardDescription>
            Complétez vos informations pour accéder aux services de la mairie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            
            {/* NOUVEAU CHAMP: Adresse */}
            <div className="space-y-2">
              <Label htmlFor="address">Adresse complète *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Ex: 123 Rue de la République"
              />
            </div>

            {/* NOUVEAU CHAMP: Ville */}
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Ville de résidence"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Quartier *</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                required
                placeholder="Nom de votre quartier"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cityHallName">Nom de la mairie du quartier *</Label>
              <Input
                id="cityHallName"
                name="cityHallName"
                value={formData.cityHallName}
                onChange={handleInputChange}
                required
                placeholder="Mairie de..."
              />
            </div>

            <div className="space-y-4">
              <Label>Photos de la carte d'identité *</Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="front-upload" className="text-sm text-muted-foreground">
                    Recto de la carte d'identité
                  </Label>
                  {identityCardFront ? (
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <span className="text-sm truncate">{identityCardFront.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('front')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Label
                      htmlFor="front-upload"
                      className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:bg-accent/50"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Cliquer pour ajouter (Recto)</span>
                    </Label>
                  )}
                  <Input
                    id="front-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'front')}
                    className="hidden"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="back-upload" className="text-sm text-muted-foreground">
                    Verso de la carte d'identité
                  </Label>
                  {identityCardBack ? (
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <span className="text-sm truncate">{identityCardBack.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('back')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Label
                      htmlFor="back-upload"
                      className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:bg-accent/50"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Cliquer pour ajouter (Verso)</span>
                    </Label>
                  )}
                  <Input
                    id="back-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'back')}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Finaliser le profil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;