import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, LogOut } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-4 mx-auto"></div>
            <div className="h-4 w-64 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mairie - Services en ligne</h1>
            <p className="text-sm text-muted-foreground">Documents d'état civil</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bienvenue, {user.email}</h2>
          <p className="text-muted-foreground">
            Accédez aux services de demande de documents d'état civil de manière sécurisée
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Extrait d'acte de naissance</CardTitle>
              <CardDescription>
                Demandez un extrait d'acte de naissance avec paiement sécurisé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Faire une demande
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Copie d'acte de naissance</CardTitle>
              <CardDescription>
                Obtenez une copie intégrale d'acte de naissance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Faire une demande
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Casier judiciaire</CardTitle>
              <CardDescription>
                Demandez votre bulletin de casier judiciaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Faire une demande
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Comment ça marche?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">1</div>
                  <h3 className="font-semibold">Choisissez</h3>
                  <p className="text-sm text-muted-foreground">Sélectionnez le document désiré</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">2</div>
                  <h3 className="font-semibold">Remplissez</h3>
                  <p className="text-sm text-muted-foreground">Complétez le formulaire requis</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">3</div>
                  <h3 className="font-semibold">Payez</h3>
                  <p className="text-sm text-muted-foreground">Réglez via Mobile Money</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">4</div>
                  <h3 className="font-semibold">Recevez</h3>
                  <p className="text-sm text-muted-foreground">Téléchargez votre document</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
