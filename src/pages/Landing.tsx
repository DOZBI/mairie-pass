import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  // ***************************************************************
  // >>> INTÉGRATION DU NOM DE LA VIDÉO ICI <<<
  // Placez votre fichier vidéo dans le dossier 'public' de votre projet
  // et mettez son nom de fichier ici (ex: /mairie-intro.mp4, /mon-gif-video.webm)
  const videoSource = "5GKS3V6YYjuTgm9Kv8.mp4"; 
  // ***************************************************************

  return (
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
            src={videoSource} // Utilisation de la constante 'videoSource'
            autoPlay 
            loop        
            muted       
            playsInline 
            className="w-full h-auto" 
          >
            Votre navigateur ne supporte pas le tag vidéo.
          </video>
        </div>

        {/* Bouton Entrer (vert foncé/noir) */}
        <Button
          size="lg"
          className="text-xl px-8 py-4 bg-[#004d40] hover:bg-[#00332c] text-white font-bold transition-colors duration-300"
          onClick={() => navigate('/auth')}
        >
          Entrer sur le site
          <ArrowRight className="ml-3 h-6 w-6" />
        </Button>
      </main>

      {/* Footer minimaliste */}
      <footer className="mt-20 text-sm text-muted-foreground absolute bottom-10">
        <p>Propulsé par la Mairie.</p>
      </footer>
    </div>
  );
};

export default Landing;
