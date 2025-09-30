import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { LogOut, ShoppingBag, Plus, BookOpen, User, Briefcase, ChevronDown } from 'lucide-react';

// Simuler des données de demandes en cours pour le compteur du panier
const DEMANDES_EN_COURS = 2;

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth'); // Redirection vers l'écran d'authentification
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Liste des services d'état civil (pour la grille)
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
      icon: Briefcase, // Document professionnel/officiel
      onClick: () => navigate('/documents/casier') 
    },
    { 
      title: "Mon Profil", 
      price: "Infos", 
      icon: User, 
      onClick: () => navigate('/profile') 
    },
    { 
      title: "Mes Demandes", 
      price: `${DEMANDES_EN_COURS} en cours`, 
      icon: LogOut, // Icône changée, mais la section "Mes Demandes" est essentielle
      onClick: () => navigate('/my-requests') 
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="animate-pulse space-y-4">
            <div className="h-10 w-40 bg-neutral-200 rounded-lg mb-8 mx-auto"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-60 w-40 bg-neutral-200 rounded-[2rem]"></div>
                <div className="h-60 w-40 bg-neutral-200 rounded-[2rem]"></div>
            </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <div className="container mx-auto max-w-lg px-4 pt-8 pb-4">
        
        {/* En-tête (Dresses) - Design Minimaliste */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tighter">
            Services
          </h1>
          
          {/* Icône du Panier/Demandes en Cours (Similaire à l'image) */}
          <div className="relative">
            <Button 
              size="icon"
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

        {/* Barre de Tri (Sort by) */}
        <div className="flex justify-between items-center mb-6">
          <Button 
             variant="ghost" 
             className="text-neutral-800 hover:bg-neutral-100 text-base font-semibold p-0 h-auto"
             onClick={() => alert("Simule l'ouverture des options de tri")}
          >
             Trier par <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
          
          <Button 
             variant="ghost" 
             className="text-neutral-500 hover:text-red-500 text-sm font-semibold"
             onClick={handleSignOut}
          >
             <LogOut className="mr-1 h-4 w-4" />
             Déconnexion
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
                duration-500 
                border-none
                // Appliquer l'effet "flottant" au second élément comme dans l'image
                ${index === 1 ? 'relative transform translate-y-2 shadow-2xl z-10' : ''} 
                cursor-pointer
                hover:scale-[1.03]
                flex flex-col
              `}
              onClick={service.onClick}
            >
              {/* Zone d'Image/Illustration (remplacée par icône thématique) */}
              <div className={`
                 h-40 w-full 
                 flex items-center justify-center 
                 ${index === 1 ? 'bg-green-100/70' : 'bg-neutral-100/70'} 
                 p-4
              `}>
                 <service.icon className={`h-20 w-20 ${index === 1 ? 'text-green-700 animate-pulse' : 'text-neutral-500'}`} />
              </div>

              {/* Détails du Service (Nom et Prix) */}
              <div className="p-4 pt-3 space-y-1 flex-1 relative">
                <CardTitle className="text-lg font-bold text-neutral-900 leading-tight">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm font-semibold text-neutral-500">
                  {service.price}
                </CardDescription>
                
                {/* Bouton Plus/Ajouter au panier (Similaire à l'image) */}
                <div className="absolute bottom-4 right-4">
                    <Button 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-green-600 hover:bg-green-700 shadow-lg text-white"
                        onClick={(e) => {
                            e.stopPropagation(); // Empêche l'événement de la carte
                            navigate(service.onClick()); 
                        }}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </Card>
          ))}
          
        </div>
        
        {/* Espace pour simuler plus de cartes en bas (similaire à l'image) */}
        <div className="mt-8 flex justify-between space-x-4 opacity-70">
            <div className="w-1/2 h-20 bg-white rounded-[2rem] shadow-md"></div>
            <div className="w-1/2 h-20 bg-white rounded-[2rem] shadow-md"></div>
        </div>

        <div className="text-center mt-10 text-xs text-neutral-400">
            Bienvenue, {user.email} | Mairie Services
        </div>

      </div>
    </div>
  );
};

export default Index;