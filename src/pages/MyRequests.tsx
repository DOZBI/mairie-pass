import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Baby,
  Shield,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MyRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("document_requests")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos demandes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocumentConfig = (type) => {
    const configs = {
      birth_certificate_extract: {
        title: "Extrait d'acte de naissance",
        icon: Baby,
      },
      birth_certificate_full: {
        title: "Copie intégrale d'acte de naissance",
        icon: FileText,
      },
      criminal_record: {
        title: "Casier judiciaire (bulletin n°3)",
        icon: Shield,
      },
    };
    return configs[type] || { title: type, icon: FileText };
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "En attente",
        icon: Clock,
        color: "text-yellow-400",
      },
      in_review: {
        label: "En cours d’examen",
        icon: AlertCircle,
        color: "text-blue-400",
      },
      approved: {
        label: "Approuvée",
        icon: CheckCircle,
        color: "text-green-400",
      },
      completed: {
        label: "Terminée",
        icon: CheckCircle,
        color: "text-green-400",
      },
      rejected: {
        label: "Rejetée",
        icon: XCircle,
        color: "text-red-400",
      },
    };
    return configs[status] || configs.pending;
  };

  const handleDownload = (url) => {
    window.open(url, "_blank");
    toast({
      title: "Téléchargement",
      description: "Le téléchargement de votre document a commencé.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Vous devez être connecté pour accéder à cette page.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-950 text-green-400">
        Chargement de vos demandes...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white p-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-green-400 hover:bg-green-500/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
        </Button>

        {/* En-tête */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-green-400 mb-2">
              Mes demandes
            </h1>
            <p className="text-gray-400">
              Consultez et suivez vos demandes de documents.
            </p>
          </div>
          <Button
            onClick={() => navigate("/documents")}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:shadow-[0_0_35px_rgba(34,197,94,0.8)] transition-all duration-300"
          >
            Nouvelle demande
          </Button>
        </div>

        {/* Si aucune demande */}
        {requests.length === 0 ? (
          <Card className="bg-black/40 border border-green-700/20 backdrop-blur-xl p-10 text-center shadow-[0_0_35px_rgba(34,197,94,0.25)]">
            <FileText className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Aucune demande</h3>
            <p className="text-gray-400 mb-6">
              Vous n’avez encore effectué aucune demande.
            </p>
            <Button
              onClick={() => navigate("/documents")}
              className="bg-green-500 hover:bg-green-600 text-black rounded-full"
            >
              Faire une première demande
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((req, i) => {
              const doc = getDocumentConfig(req.document_type);
              const status = getStatusConfig(req.status);
              const DocIcon = doc.icon;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-black/40 border border-green-700/20 backdrop-blur-xl hover:shadow-[0_0_35px_rgba(34,197,94,0.25)] transition-all duration-300">
                    <CardHeader className="flex justify-between items-center pb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/10 border border-green-400/20 rounded-xl">
                          <DocIcon className="h-7 w-7 text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            {doc.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                            <span className={status.color}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-sm text-gray-500">
                        <div>Demandé le</div>
                        <div className="text-white font-medium">
                          {format(new Date(req.created_at), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                      <p className="text-gray-400 text-sm mb-3">
                        {status.label === "Terminée"
                          ? "Votre document est prêt."
                          : status.label === "Rejetée"
                          ? "Votre demande a été refusée."
                          : "Demande en traitement."}
                      </p>

                      {req.status === "completed" && req.document_url && (
                        <Button
                          onClick={() =>
                            handleDownload(req.document_url, req.document_type)
                          }
                          className="bg-green-500 hover:bg-green-600 text-black font-semibold rounded-full mt-3"
                        >
                          <Download className="h-4 w-4 mr-2" /> Télécharger
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyRequests;
                
