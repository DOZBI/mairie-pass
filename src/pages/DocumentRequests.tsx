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
      title: "Extrait d'acte de naissance",
      description: 'Document officiel certifiant votre naissance',
      icon: User,
      gradient: 'from-green-600 to-emerald-500'
    },
    {
      type: 'birth_certificate_full',
      title: 'Acte de naissance complet',
      description: 'Document complet avec toutes les informations de naissance',
      icon: FileText,
      gradient: 'from-lime-500 to-green-600'
    },
    {
      type: 'criminal_record',
      title: 'Extrait de casier judiciaire',
      description: 'Certificat de bonne conduite et moralité',
      icon: Shield,
      gradient: 'from-emerald-500 to-teal-500'
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white p-4">
        <div className="container mx-auto p-4 max-w-2xl">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-6 hover:bg-green-900/40 text-green-400"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Demande de {selectedDoc?.title}
            </h1>
            <p className="text-gray-400 text-lg">
              {selectedDoc?.description}
            </p>
          </div>

          <div className="bg-black/50 border border-green-700/30 rounded-2xl p-6 shadow-[0_0_35px_rgba(34,197,94,0.25)]">
            <DocumentRequestForm 
              documentType={selectedDocument}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 text-white p-4">
      <div className="container mx-auto p-4 max-w-5xl">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6 hover:bg-green-900/40 text-green-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </Link>
        
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-emerald-500 to-lime-400 bg-clip-text text-transparent">
            Demander un document
          </h1>
          <p className="text-gray-400 text-xl">
            Sélectionnez le type de document que vous souhaitez demander
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {documentTypes.map((doc) => {
            const IconComponent = doc.icon;
            return (
              <Card 
                key={doc.type}
                className="cursor-pointer transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-105 border border-green-800/30 bg-black/60 backdrop-blur-md rounded-3xl group"
                onClick={() => handleDocumentSelect(doc.type)}
              >
                <CardHeader className="text-center pb-3">
                  <div className={`mx-auto mb-4 p-4 bg-gradient-to-br ${doc.gradient} rounded-2xl w-fit shadow-[0_0_25px_rgba(34,197,94,0.5)] group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-10 w-10 text-black/80" />
                  </div>
                  <CardTitle className="text-xl text-green-400">{doc.title}</CardTitle>
                  <CardDescription className="text-gray-400">{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full bg-gradient-to-r ${doc.gradient} hover:opacity-90 text-black font-semibold shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300 rounded-full`}>
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
      
