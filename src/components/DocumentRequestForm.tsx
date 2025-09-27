import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, Baby, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentRequestFormProps {
  documentType: string;
  onSuccess: () => void;
}

const DocumentRequestForm = ({ documentType, onSuccess }: DocumentRequestFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState({
    fullName: '',
    birthDate: '',
    birthPlace: '',
    parentNames: '',
    purpose: ''
  });

  const documentConfig = {
    birth_certificate_extract: {
      title: 'Extrait d\'acte de naissance',
      icon: Baby,
      fields: ['fullName', 'birthDate', 'birthPlace', 'purpose']
    },
    birth_certificate_full: {
      title: 'Copie intégrale d\'acte de naissance',
      icon: FileText,
      fields: ['fullName', 'birthDate', 'birthPlace', 'parentNames', 'purpose']
    },
    criminal_record: {
      title: 'Casier judiciaire (bulletin n°3)',
      icon: Shield,
      fields: ['fullName', 'birthDate', 'birthPlace', 'purpose']
    }
  };

  const config = documentConfig[documentType as keyof typeof documentConfig];
  const Icon = config?.icon || FileText;

  const handleInputChange = (field: string, value: string) => {
    setAdditionalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('document_requests')
        .insert([{
          user_id: user.id,
          document_type: documentType as any,
          reason,
          additional_info: additionalInfo
        }]);

      if (error) throw error;

      toast({
        title: "Demande envoyée",
        description: "Votre demande de document a été envoyée avec succès.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (field: string) => {
    const labels = {
      fullName: 'Nom complet',
      birthDate: 'Date de naissance',
      birthPlace: 'Lieu de naissance',
      parentNames: 'Nom des parents',
      purpose: 'Motif de la demande'
    };
    return labels[field as keyof typeof labels] || field;
  };

  const getFieldPlaceholder = (field: string) => {
    const placeholders = {
      fullName: 'Nom Prénom',
      birthDate: 'JJ/MM/AAAA',
      birthPlace: 'Ville, Pays',
      parentNames: 'Nom du père, Nom de la mère',
      purpose: 'Ex: Renouvellement de passeport, Inscription scolaire...'
    };
    return placeholders[field as keyof typeof placeholders] || '';
  };

  if (!config) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Type de document non reconnu</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>
          Remplissez les informations ci-dessous pour votre demande
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {config.fields.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>{getFieldLabel(field)}</Label>
              {field === 'purpose' ? (
                <Textarea
                  id={field}
                  value={additionalInfo[field as keyof typeof additionalInfo]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder={getFieldPlaceholder(field)}
                  required
                  rows={3}
                />
              ) : (
                <Input
                  id={field}
                  type={field === 'birthDate' ? 'date' : 'text'}
                  value={additionalInfo[field as keyof typeof additionalInfo]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder={getFieldPlaceholder(field)}
                  required
                />
              )}
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="reason">Motif détaillé (optionnel)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Informations complémentaires sur votre demande..."
              rows={3}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Important :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Vérifiez que toutes les informations sont correctes</li>
              <li>• Votre profil doit être complet avec pièces d'identité</li>
              <li>• Vous recevrez une notification par email</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onSuccess} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer la demande
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentRequestForm;