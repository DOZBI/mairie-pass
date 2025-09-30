import React, { useState } from 'react';
import { ArrowLeft, FileText, Shield, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentRequestForm from '@/components/DocumentRequestForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DocumentRequests = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de se déconnecter.",
      });
    }
  };

  const documentTypes = [
    {
      type: 'birth_certificate_extract',
      title: 'Extrait d\'acte de naissance',
      description: 'Document officiel certifiant votre naissance',
      icon: User,
    },
    {
      type: 'birth_certificate_full',
      title: 'Acte de naissance complet',
      description: 'Document complet avec toutes les informations de naissance',
      icon: FileText,
    },
    {
      type: 'criminal_record',
      title: 'Extrait de casier judiciaire',
      description: 'Certificat de bonne conduite et moralité',
      icon: Shield,
    },
  ];

  const handleDocumentSelect = (documentType: string) => {
    setSelectedDocument(documentType);
  };

  const handleSuccess = () => {
    setSelectedDocument(null);
  };

  const handleBack = () => {
    setSelectedDocument(null);
  };

  if (selectedDocument) {
    const selectedDoc = documentTypes.find(doc => doc.type === selectedDocument);
    
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Demande de {selectedDoc?.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {selectedDoc?.description}
          </p>
        </div>

        <DocumentRequestForm 
          documentType={selectedDocument}
          onSuccess={handleSuccess}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </Link>
          <Button variant="outline" onClick={handleSignOut} className="text-destructive hover:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Demander un document</h1>
        <p className="text-muted-foreground mt-2">
          Sélectionnez le type de document que vous souhaitez demander
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documentTypes.map((doc) => {
          const IconComponent = doc.icon;
          return (
            <Card 
              key={doc.type}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-border"
              onClick={() => handleDocumentSelect(doc.type)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-foreground">{doc.title}</CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Demander ce document
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentRequests;