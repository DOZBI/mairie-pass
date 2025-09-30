import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Shield, LogOut, ShoppingBag, Plus, BookOpen, Clock, Zap } from 'lucide-react';
// Simuler des données de demandes en cours pour le compteur du panier
const DEMANDES_EN_COURS = 2; // Remplacer par un state ou un hook réel

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // Redirection vers la page d'authentification si non connecté
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/'); // Rediriger vers l'écran d'accueil ou de connexion
  };

  // Icônes et services stylisés pour la grille
  const services = [
    { 
      title: "Acte de Naissance", 
      price: "1500 XOF", 
      icon: BookOpen, 
      onClick: () => navigate('/documents/naissance') 
    },
    { 
      title: "Casier Judiciaire", 
      price: "2000 XOF", 
      icon: Shield, 
      onClick: () => navigate('/documents/casier') 
    },
    { 
      title: "Mariage/PACS", 
      price: "1800 XOF", 
      icon: Heart, 
      onClick: () => navigate('/documents/mariage') 
    },
    { 
      title: "Certificat de Vie", 
      price: "1000 XOF", 
      icon: Users, 
      onClick: () => navigate('/documents/vie') 
    },
  ];

  if (loading) {
    // Squelette de chargement minimaliste
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-40 bg-neutral-200 rounded-lg mb-8 mx-auto"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-60 w-40 bg-neutral-200 rounded-[2rem]"></div>
                <div className="h-60 w-40 bg-neutral-200 rounded-[2rem]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto max-w-lg px-4 pt-8 pb-4">
        
        {/* En-tête (Dresses) */}
        <header className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-extrabold text-neutral-900 font-serif">
            Services
          </h1>
          
          {/* Icône du Panier/Demandes en Cours (Similaire à l'image) */}
          <div className="relative">
            <Button 
              variant="outline" 
              className="w-12 h-12 rounded-xl border-neutral-300 bg-white shadow-md hover:bg-neutral-100"
              onClick={() => navigate('/my-requests')}
              title="Mes demandes en cours"
            >
              <ShoppingBag className="h-6 w-6 text-neutral-800" />
            </Button>
            {DEMANDES_EN_COURS > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {DEMANDES_EN_COURS}
              </span>
            )}
          </div>
        </header>

        {/* Barre de tri/filtre (Sort by) */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-neutral-600 font-semibold flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <p className="text-sm">Demandes : {DEMANDES_EN_COURS} en cours</p>
          </div>
          <Button 
             variant="ghost" 
             className="text-neutral-600 hover:bg-neutral-100 text-sm font-semibold"
             onClick={handleSignOut}
          >
             <LogOut className="mr-1 h-4 w-4" />
             Quitter
          </Button>
        </div>

        {/* Grille des Services (Produits) */}
        <div className="grid grid-cols-2 gap-4">
          
          {services.map((service, index) => (
            <Card 
              key={index}
              className={`
                bg-white 
                rounded-[2rem] 
                overflow-hidden 
                shadow-xl 
                transition-all 
                duration-300 
                border-none
                ${index === 1 ? 'relative transform translate-y-2 shadow-2xl z-10' : ''} 
                cursor-pointer
                hover:scale-[1.03]
              `}
              onClick={service.onClick}
            >
              {/* Zone d'Image/Illustration */}
              <div className={`
                 h-40 w-full 
                 flex items-center justify-center 
                 bg-neutral-100 
                 ${index === 1 ? 'bg-green-100/70' : 'bg-neutral-100'} 
                 rounded-[2rem] p-4
              `}>
                 <service.icon className={`h-16 w-16 ${index === 1 ? 'text-green-700 animate-pulse' : 'text-neutral-500'}`} />
              </div>

              {/* Détails du Service (Nom et Prix) */}
              <div className="p-4 pt-3 space-y-1">
                <CardTitle className="text-base font-bold text-neutral-900">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm font-semibold text-neutral-500">
                  {service.price}
                </CardDescription>
                
                {/* Bouton Plus/Ajouter (similaire à l'icône de l'image) */}
                <div className={`absolute bottom-4 right-4 ${index === 1 ? 'block' : 'hidden md:block'}`}>
                    <Button 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 shadow-lg text-white"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </Card>
          ))}
          
        </div>
        
        {/* Carte secondaire pour le profil ou l'aide (simule la 3ème/4ème carte de l'image) */}
        <div className="mt-8">
             <Card 
                className="flex items-center justify-between p-6 rounded-3xl shadow-lg border-neutral-200 hover:shadow-xl transition-shadow cursor-pointer bg-white"
                onClick={() => navigate('/profile')}
            >
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-neutral-100 rounded-xl">
                        <Shield className="h-6 w-6 text-neutral-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold">Mon Profil Sécurisé</CardTitle>
                        <CardDescription>Mettez à jour vos infos et justificatifs.</CardDescription>
                    </div>
                </div>
                <Zap className="h-5 w-5 text-neutral-500" />
            </Card>
        </div>
        
        <div className="text-center mt-10 text-sm text-neutral-500">
            Connecté en tant que **{user.email}**
        </div>

      </div>
    </div>
  );
};

export default Index;