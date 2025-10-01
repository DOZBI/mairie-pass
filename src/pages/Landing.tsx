import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  // Assurez-vous que votre vidéo est bien dans le dossier 'public'
  const videoSource = "/mairie-intro.mp4"; 

  return (
    // Utilisez bg-background ou une couleur unie claire si vous voulez un look encore plus épuré (par exemple bg-white si vous utilisez Tailwind par défaut)
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">

      {/* Main Content Centered */}
      <main className="text-center max-w-lg w-full">
        
        {/* Titre central et épuré */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-foreground">
          Mairie Services en ligne
        </h1>
        
        {/* Vidéo pour l'effet GIF, sans aucun contour ni ombre */}
        <div className="mb-12 w-full max-w-xs mx-auto">
          <video
            src={videoSource}
            // Configuration pour l'effet GIF/intro
            autoPlay 
            loop        
            muted       
            playsInline 
            // W-full pour prendre la largeur définie par le conteneur, h-auto pour garder les proportions
            className="w-full h-auto" 
          >
            Votre navigateur ne supporte pas le tag vidéo.
          </video>
        </div>

        {/* Bouton Entrer (vert foncé/noir) */}
        {/* Style simple, centré, grande taille */}
        <Button
          size="lg"
          // Classe custom pour un vert très foncé, presque noir (Hex: #004d40)
          // J'ai rendu le bouton un peu plus compact, mais vous pouvez réaugmenter la taille (px-12 py-8) si vous préférez le style précédent
          className="text-xl px-8 py-4 bg-[#004d40] hover:bg-[#00332c] text-white font-bold transition-colors duration-300"
          onClick={() => navigate('/auth')}
        >
          Entrer sur le site
          <ArrowRight className="ml-3 h-6 w-6" />
        </Button>
      </main>

      {/* Footer minimaliste, comme souvent sur les applications mobile/intro */}
      <footer className="mt-20 text-sm text-muted-foreground absolute bottom-10">
        <p>Propulsé par la Mairie.</p>
      </footer>
    </div>
  );
};

export default Landing;