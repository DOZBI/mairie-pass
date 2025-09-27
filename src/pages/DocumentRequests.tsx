import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Baby } from 'lucide-react';
import DocumentRequestForm from '@/components/DocumentRequestForm';

const DocumentRequests = () => {
  const { user } = useAuth();
  const [selectedDocumentType, setSelectedDocumentType] = useState<string | null>(null);

  if (!user) {
    return <div>Vous devez être connecté pour accéder à cette page.</div>;
  }

  const documentTypes = [
    {
      id: 'birth_certificate_extract',
      title: 'Extrait d\'acte de naissance',
      description: 'Document officiel pour justifier de votre état civil',
      icon: Baby,
      price: 'Gratuit',
      processingTime: '2-3 jours ouvrables'
    },
    {
      id: 'birth_certificate_full',
      title: 'Copie intégrale d\'acte de naissance',
      description: 'Document complet avec filiation pour démarches administratives',
      icon: FileText,
      price: '5€',
      processingTime: '3-5 jours ouvrables'
    },
    {
      id: 'criminal_record',
      title: 'Casier judiciaire (bulletin n°3)',
      description: 'Extrait de casier judiciaire pour emploi ou concours',
      icon: Shield,
      price: 'Gratuit',
      processingTime: '5-7 jours ouvrables'
    }
  ];

  if (selectedDocumentType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDocumentType(null)}
            className="mb-6"
          >
            ← Retour aux demandes
          </Button>
          <DocumentRequestForm 
            documentType={selectedDocumentType}
            onSuccess={() => setSelectedDocumentType(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Demandes de documents</h1>
          <p className="text-muted-foreground">
            Sélectionnez le type de document que vous souhaitez demander
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            return (
              <Card key={docType.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{docType.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {docType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prix :</span>
                      <Badge variant="secondary">{docType.price}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Délai :</span>
                      <span className="font-medium">{docType.processingTime}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSelectedDocumentType(docType.id)}
                    className="w-full"
                  >
                    Demander ce document
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Informations importantes</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Tous les documents sont délivrés au format PDF sécurisé</li>
            <li>• Une notification vous sera envoyée dès que votre document est prêt</li>
            <li>• Les documents gratuits peuvent être demandés une fois par mois</li>
            <li>• Un justificatif d'identité valide est requis pour toute demande</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocumentRequests;