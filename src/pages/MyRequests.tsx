import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Baby, Shield, Download, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentRequest {
  id: string;
  document_type: string;
  status: string;
  reason?: string;
  additional_info?: any;
  admin_notes?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

const MyRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('document_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos demandes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentConfig = (type: string) => {
    const configs = {
      birth_certificate_extract: {
        title: 'Extrait d\'acte de naissance',
        icon: Baby
      },
      birth_certificate_full: {
        title: 'Copie intégrale d\'acte de naissance',
        icon: FileText
      },
      criminal_record: {
        title: 'Casier judiciaire (bulletin n°3)',
        icon: Shield
      }
    };
    return configs[type as keyof typeof configs] || { title: type, icon: FileText };
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        label: 'En attente',
        variant: 'secondary' as const,
        icon: Clock,
        description: 'Votre demande a été reçue et est en attente de traitement'
      },
      in_review: {
        label: 'En cours d\'examen',
        variant: 'default' as const,
        icon: AlertCircle,
        description: 'Votre demande est actuellement examinée par nos services'
      },
      approved: {
        label: 'Approuvée',
        variant: 'default' as const,
        icon: CheckCircle,
        description: 'Votre demande a été approuvée, le document est en préparation'
      },
      completed: {
        label: 'Terminée',
        variant: 'default' as const,
        icon: CheckCircle,
        description: 'Votre document est prêt et peut être téléchargé'
      },
      rejected: {
        label: 'Rejetée',
        variant: 'destructive' as const,
        icon: XCircle,
        description: 'Votre demande a été rejetée'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const handleDownload = async (documentUrl: string, documentType: string) => {
    try {
      // Dans un vrai système, ceci ferait un appel sécurisé au serveur
      window.open(documentUrl, '_blank');
      toast({
        title: "Téléchargement",
        description: "Le téléchargement de votre document a commencé.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le document.",
      });
    }
  };

  if (!user) {
    return <div>Vous devez être connecté pour accéder à cette page.</div>;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes demandes</h1>
            <p className="text-muted-foreground">
              Suivez l'état de vos demandes de documents
            </p>
          </div>
          <Button onClick={() => window.location.href = '/documents'}>
            Nouvelle demande
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune demande</h3>
              <p className="text-muted-foreground mb-4">
                Vous n'avez encore fait aucune demande de document.
              </p>
              <Button onClick={() => window.location.href = '/documents'}>
                Faire une première demande
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const docConfig = getDocumentConfig(request.document_type);
              const statusConfig = getStatusConfig(request.status);
              const DocIcon = docConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={request.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <DocIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{docConfig.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusIcon className="h-4 w-4" />
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Demandé le</div>
                        <div className="font-medium">
                          {format(new Date(request.created_at), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {statusConfig.description}
                    </p>
                    
                    {request.additional_info && (
                      <div className="bg-muted/50 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-sm mb-2">Informations de la demande :</h4>
                        <div className="text-sm space-y-1">
                          {request.additional_info.fullName && (
                            <div><span className="font-medium">Nom :</span> {request.additional_info.fullName}</div>
                          )}
                          {request.additional_info.purpose && (
                            <div><span className="font-medium">Motif :</span> {request.additional_info.purpose}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-sm mb-1 text-blue-800 dark:text-blue-200">
                          Note de l'administration :
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{request.admin_notes}</p>
                      </div>
                    )}

                    {request.status === 'completed' && request.document_url && (
                      <Button 
                        onClick={() => handleDownload(request.document_url!, request.document_type)}
                        className="w-full sm:w-auto"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger le document
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;