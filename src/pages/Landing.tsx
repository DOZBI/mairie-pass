import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mairie - Services en ligne</h1>
            <p className="text-sm text-muted-foreground">Documents d'état civil</p>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Se connecter
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Vos documents d'état civil
            <br />
            <span className="text-primary">en quelques clics</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Demandez vos documents officiels en ligne de manière sécurisée et rapide. 
            Plus besoin de vous déplacer à la mairie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Services disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Extrait d'acte de naissance</CardTitle>
                <CardDescription>
                  Obtenez un extrait d'acte de naissance officiel pour vos démarches administratives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Délivrance immédiate</li>
                  <li>• Format PDF sécurisé</li>
                  <li>• Paiement Mobile Money</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Copie d'acte de naissance</CardTitle>
                <CardDescription>
                  Demandez une copie intégrale d'acte de naissance avec toutes les mentions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Document complet</li>
                  <li>• Toutes les mentions</li>
                  <li>• Validité officielle</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Casier judiciaire</CardTitle>
                <CardDescription>
                  Bulletin de casier judiciaire (bulletin n°3) pour vos candidatures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Bulletin n°3</li>
                  <li>• Traitement rapide</li>
                  <li>• Sécurisé et confidentiel</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">1</div>
              <h4 className="font-semibold mb-2">Créez votre compte</h4>
              <p className="text-sm text-muted-foreground">
                Inscrivez-vous avec vos informations personnelles et votre pièce d'identité
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">2</div>
              <h4 className="font-semibold mb-2">Choisissez votre document</h4>
              <p className="text-sm text-muted-foreground">
                Sélectionnez le type de document dont vous avez besoin
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">3</div>
              <h4 className="font-semibold mb-2">Payez en ligne</h4>
              <p className="text-sm text-muted-foreground">
                Réglez de manière sécurisée via Mobile Money ou carte bancaire
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">4</div>
              <h4 className="font-semibold mb-2">Téléchargez</h4>
              <p className="text-sm text-muted-foreground">
                Recevez et téléchargez votre document officiel immédiatement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Pourquoi choisir nos services en ligne ?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Gain de temps</h4>
                    <p className="text-muted-foreground">Plus besoin de faire la queue à la mairie</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Disponible 24h/24</h4>
                    <p className="text-muted-foreground">Faites vos demandes quand vous voulez</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Sécurisé</h4>
                    <p className="text-muted-foreground">Vos données sont protégées et cryptées</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Rapide</h4>
                    <p className="text-muted-foreground">Obtenez vos documents en quelques minutes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Clock className="h-24 w-24 text-primary mx-auto mb-6" />
              <h4 className="text-xl font-semibold mb-2">Traitement instantané</h4>
              <p className="text-muted-foreground">
                La plupart des demandes sont traitées immédiatement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Prêt à commencer ?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Créez votre compte dès maintenant et accédez à tous nos services en ligne
          </p>
          <Button size="lg" onClick={() => navigate('/auth')}>
            Créer mon compte gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Mairie - Services en ligne. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;