import React, { useState } from 'react';
import { ArrowLeft, FileText, Shield, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DocumentRequestForm from '@/components/DocumentRequestForm';

const DocumentRequests = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const documentTypes = [
    {
      type: 'birth_certificate_extract',
      title: 'Extrait d\'acte de naissance',
      description: 'Document officiel certifiant votre naissance',
      icon: User,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'birth_certificate_full',
      title: 'Acte de naissance complet',
      description: 'Document complet avec toutes les informations de naissance',
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      type: 'criminal_record',
      title: 'Extrait de casier judiciaire',
      description: 'Certificat de bonne conduite et moralité',
      icon: Shield,
      gradient: 'from-green-500 to-emerald-500'
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="container mx-auto p-4 max-w-2xl">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-6 hover:bg-white/50 dark:hover:bg-gray-800/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Demande de {selectedDoc?.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {selectedDoc?.description}
            </p>
          </div>

          <DocumentRequestForm 
            documentType={selectedDocument}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container mx-auto p-4 max-w-5xl">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6 hover:bg-white/50 dark:hover:bg-gray-800/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </Link>
        
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Demander un document
          </h1>
          <p className="text-muted-foreground text-xl">
            Sélectionnez le type de document que vous souhaitez demander
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {documentTypes.map((doc) => {
            const IconComponent = doc.icon;
            return (
              <Card 
                key={doc.type}
                className="cursor-pointer transition-all hover:shadow-2xl hover:scale-105 border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm group"
                onClick={() => handleDocumentSelect(doc.type)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`mx-auto mb-4 p-4 bg-gradient-to-br ${doc.gradient} rounded-2xl w-fit shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl">{doc.title}</CardTitle>
                  <CardDescription className="text-base">{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full bg-gradient-to-r ${doc.gradient} hover:opacity-90 text-white font-semibold shadow-lg transition-all duration-300`}>
                    Demander ce document
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentRequests;
