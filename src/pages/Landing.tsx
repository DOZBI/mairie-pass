import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; // Seul l'icône de flèche est nécessaire
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  // Le chemin '/mairie-intro.mp4' suppose que votre fichier vidéo
  // est nommé 'mairie-intro.mp4' et est placé dans le dossier 'public'.
  const videoSource = "/mairie-intro.mp4";

  return (
    <div className="min-h-screen bg-background">
      {/* Header minimal */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mairie - Services en ligne</h1>
            <p className="text-sm text-muted-foreground">Documents d'état civil</p>
          </div>
        </div>
      </header>

      {/* Cover Page Section */}
      {/* Le calcul min-h-[calc(100vh-65px)] ajuste la hauteur pour remplir l'écran moins la hauteur du header (estimée à ~65px) */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-10">
        <div className="text-center max-w-4xl w-full">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-foreground">
            Accédez à vos documents officiels
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12">
            Sécurisé, rapide et disponible 24h/24
          </p>

          {/* Vidéo du dossier public */}
          <div className="mb-12 rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100 max-w-3xl mx-auto">
            <video
              src={videoSource}
              // Les attributs suivants sont recommandés pour une vidéo d'accroche/cover
              autoPlay
              loop
              muted
              playsInline // Améliore la lecture sur mobile
              controls // Laissez les contrôles pour l'accessibilité si c'est une vidéo informative
              className="w-full h-auto"
            >
              Votre navigateur ne supporte pas le tag vidéo.
            </video>
          </div>

          {/* Bouton Entrer (vert foncé/noir) */}
          <Button
            size="lg"
            // Classe custom pour un vert très foncé, presque noir, comme demandé
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