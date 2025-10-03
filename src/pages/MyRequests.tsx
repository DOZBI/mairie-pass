import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Baby, Shield, Download, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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
        bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20',
        description: 'Votre demande a été reçue et est en attente de traitement'
      },
      in_review: {
        label: 'En cours d\'examen',
        variant: 'default' as const,
        icon: AlertCircle,
        bgColor: 'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
        description: 'Votre demande est actuellement examinée par nos services'
      },
      approved: {
        label: 'Approuvée',
        variant: 'default' as const,
        icon: CheckCircle,
        bgColor: 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
        description: 'Votre demande a été approuvée, le document est en préparation'
      },
      completed: {
        label: 'Terminée',
        variant: 'default' as const,
        icon: CheckCircle,
        bgColor: 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
        description: 'Votre document est prêt et peut être téléchargé'
      },
      rejected: {
        label: 'Rejetée',
        variant: 'destructive' as const,
        icon: XCircle,
        bgColor: 'from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20',
        description: 'Votre demande a été rejetée'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const handleDownload = async (documentUrl: string, documentType: string) => {
    try {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-6 hover:bg-white/50 dark:hover:bg-gray-800/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Mes demandes
              </h1>
              <p className="text-muted-foreground text-lg">
                Suivez l'état de vos demandes de documents
              </p>
            </div>
            <Button 
              onClick={() => navigate('/documents')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Nouvelle demande
            </Button>
          </div>

          {requests.length === 0 ? (
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="inline-block p-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full mb-4">
                  <FileText className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Aucune demande</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Vous n'avez encore fait aucune demande de document.
                </p>
                <Button 
                  onClick={() => navigate('/documents')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Faire une première demande
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => {
                const docConfig = getDocumentConfig(request.document_type);
                const statusConfig = getStatusConfig(request.status);
                const DocIcon = docConfig.icon;
                const StatusIcon = statusConfig.icon;

                return (
                  <Card 
                    key={request.id} 
                    className={`border-0 shadow-xl bg-gradient-to-br ${statusConfig.bgColor} backdrop-blur-sm hover:shadow-2xl transition-all duration-300`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg">
                            <DocIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <CardTitle className="text-xl mb-2">{docConfig.title}</CardTitle>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-5 w-5" />
                              <Badge variant={statusConfig.variant} className="text-sm font-semibold">
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="font-medium">Demandé le</div>
                          <div className="font-bold text-base">
                            {format(new Date(request.created_at), 'dd MMMM yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 font-medium">
                        {statusConfig.description}
                      </p>
                      
                      {request.additional_info && (
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-xl mb-4 border border-white/20">
                          <h4 className="font-semibold text-sm mb-2">Informations de la demande :</h4>
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
                        <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
                          <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Note de l'administration :
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{request.admin_notes}</p>
                        </div>
                      )}

                      {request.status === 'completed' && request.document_url && (
                        <Button 
                          onClick={() => handleDownload(request.document_url!, request.document_type)}
                          className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
    </div>
  );
};

export default MyRequests;
