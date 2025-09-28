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
      navigate('/');
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
      <div className="max-w-md mx-auto bg-background">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Sort by */}
        <div className="px-6 mb-6">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Sort by
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>

        {/* Services Grid */}
        <div className="px-6 grid grid-cols-2 gap-4">
          <Card 
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer bg-card border-0 shadow-sm rounded-3xl" 
            onClick={() => navigate('/documents')}
          >
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <FileText className="h-16 w-16 text-blue-600" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1">Demander Document</h3>
              <p className="text-xs text-muted-foreground">Gratuit</p>
            </CardContent>
          </Card>

          <Card 
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer bg-card border-0 shadow-sm rounded-3xl"
            onClick={() => navigate('/my-requests')}
          >
            <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
              <Users className="h-16 w-16 text-green-600" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1">Mes Demandes</h3>
              <p className="text-xs text-muted-foreground">Suivi</p>
            </CardContent>
          </Card>

          <Card 
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer bg-card border-0 shadow-sm rounded-3xl"
            onClick={() => navigate('/profile')}
          >
            <div className="aspect-square bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
              <Shield className="h-16 w-16 text-purple-600" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1">Mon Profil</h3>
              <p className="text-xs text-muted-foreground">Gérer</p>
            </CardContent>
          </Card>

          <Card 
            className="overflow-hidden hover:shadow-lg transition-all cursor-pointer bg-card border-0 shadow-sm rounded-3xl"
          >
            <div className="aspect-square bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
              <svg className="h-16 w-16 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1">Aide & Support</h3>
              <p className="text-xs text-muted-foreground">24h/7j</p>
            </CardContent>
          </Card>
        </div>

        <div className="p-6 mt-8">
          <p className="text-xs text-center text-muted-foreground">
            Bienvenue, {user.email?.split('@')[0]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
