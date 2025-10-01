import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  // Assurez-vous que votre vidéo est bien dans le dossier 'public'
  const videoSource = "/mairie-intro.mp4"; 

  return (
    <div className="min-h-screen bg-background">
      {/* Header minimal et simple */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mairie - Services en ligne</h1>
            <p className="text-sm text-muted-foreground">Documents d'état civil</p>
          </div>
        </div>
      </header>

      {/* Cover Page Section - Vidéo et Bouton */}
      {/* Le calcul min-h-[calc(100vh-65px)] ajuste la hauteur pour remplir l'écran moins la hauteur du header */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-10">
        <div className="text-center max-w-4xl w-full">
          
          {/* Vidéo pour l'effet GIF */}
          <div className="mb-12 rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100 max-w-3xl mx-auto">
            <video
              src={videoSource}
              // Pour un effet GIF, on garde :
              autoPlay    // Démarre la lecture automatiquement
              loop        // Répète la vidéo en boucle
              muted       // Important: la lecture automatique est souvent bloquée si non 'muted'
              playsInline // Améliore la lecture sur mobile
              // On retire l'attribut 'controls' pour masquer l'interface de contrôle
              className="w-full h-auto"
              // Optional: Ajoutez un 'poster' (image statique) si la vidéo ne se charge pas immédiatement
              // poster="/mairie-intro-poster.jpg" 
            >
              Votre navigateur ne supporte pas le tag vidéo.
            </video>
          </div>

          {/* Titre et description minimalistes au-dessus ou au-dessous de la vidéo */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
              Simplifiez vos démarches en ligne
            </h2>
            <p className="text-xl text-muted-foreground">
              Accédez directement aux services d'état civil de la mairie.
            </p>
          </div>

          {/* Bouton Entrer (vert foncé/noir) */}
          <Button
            size="lg"
            // Classe custom pour un vert très foncé, presque noir (Hex: #004d40)
            className="text-2xl px-12 py-8 bg-[#004d40] hover:bg-[#00332c] text-white font-bold transition-colors duration-300 shadow-xl shadow-[#004d40]/50"
            onClick={() => navigate('/auth')}
          >
            Entrer sur le site
            <ArrowRight className="ml-4 h-7 w-7" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Landing;