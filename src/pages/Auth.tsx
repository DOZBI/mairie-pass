import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Globe, Loader2, MessageCircle, Phone, Video } from 'lucide-react';

// Composant de l'icône WhatsApp stylisée (simplifiée)
const WhatsAppIconPattern = () => (
  <div className="relative w-48 h-48 mx-auto my-8 flex items-center justify-center">
    {/* Un cercle vert avec une icône de message simple pour simuler le motif */}
    <div className="relative w-40 h-40 rounded-full bg-green-50/50 flex items-center justify-center">
      <div className="w-32 h-32 rounded-full bg-green-100/70 flex items-center justify-center">
        <MessageCircle className="h-10 w-10 text-green-600" />
      </div>
      {/* Simulation des petites icônes autour */}
      <Phone className="absolute top-0 right-8 h-4 w-4 text-green-500 transform rotate-12" />
      <Video className="absolute bottom-4 left-4 h-4 w-4 text-green-500 transform -rotate-24" />
      <Globe className="absolute top-10 left-0 h-4 w-4 text-green-500 transform -rotate-45" />
    </div>
  </div>
);


const Auth = () => {
  const [loading, setLoading] = useState(false);
  // *** NOUVEL ÉTAT POUR LA TRANSITION DE SORTIE ***
  const [isExiting, setIsExiting] = useState(false); 
  // ------------------------------------------------
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // FONCTION MODIFIÉE : Lance l'animation de sortie AVANT de naviguer
  const handleAgreeAndContinue = () => {
    setLoading(true);
    // *** Déclenche l'animation de sortie ***
    setIsExiting(true); 
    // --------------------------------------
    
    // Simuler le délai d'animation (doit correspondre à la durée dans le CSS : 500ms)
    const transitionDuration = 500; 

    setTimeout(() => {
      setLoading(false);
      
      // *** Navigation après la fin de la transition ***
      navigate('/signup'); 
      
    }, transitionDuration); 
  };

  return (
    // Conteneur plein écran, centré
    // *** AJOUT DE LA CLASSE DYNAMIQUE ET DE LA CLASSE DE BASE POUR L'ANIMATION ***
    <div className={`min-h-screen flex flex-col items-center justify-between bg-white p-6 pt-20 pb-10 text-center transition-transform duration-500 ease-in-out ${isExiting ? 'slide-out-left' : 'slide-in-right'}`}>
      
      {/* Header (vide ou minimaliste pour correspondre à l'image) */}
      <div></div>

      {/* Contenu Central : Illustration et Texte (inchangé) */}
      <div className="flex flex-col items-center">
        
        {/* L'illustration/Icône stylisée */}
        <WhatsAppIconPattern />

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bienvenue sur Foutadocument
        </h1>

        <p className="text-sm text-gray-600 px-4 max-w-sm">
          Lisez notre{' '}
          <a href="/privacy" className="text-green-600 hover:text-green-700 font-semibold underline">
            Politique de confidentialité
          </a>
          . Tapotez "J'accepte et continuer" pour accepter les{' '}
          <a href="/terms" className="text-green-600 hover:text-green-700 font-semibold underline">
            Conditions d'utilisation
          </a>
          .
        </p>

      </div>

      {/* Pied de Page : Bouton et Choix de Langue (inchangé) */}
      <div className="w-full max-w-sm px-4 space-y-6">
        {/* Bouton Vert Principal */}
        <Button 
          onClick={handleAgreeAndContinue}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-full text-base"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          J'accepte et continuer
        </Button>

        {/* Choix de Langue (simulé) */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Globe className="h-4 w-4" />
          <span>Français (France)</span>
        </div>
      </div>

    </div>
  );
};

export default Auth;
          
