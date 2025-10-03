import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  const videoSource = "/5GKS3V6YYjuTgm9Kv8.mp4"; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <main className="text-center max-w-4xl w-full z-10 relative">
        
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white animate-fade-in">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Services d'État Civil
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-12 animate-fade-in">
          Votre mairie digitale, disponible 24/7
        </p>

        {/* Video Container */}
        <div className="mb-12 w-full max-w-2xl mx-auto animate-fade-in">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/50 transition-shadow duration-500 border-4 border-purple-500/30">
            <video
              src={videoSource}
              autoPlay 
              loop        
              muted       
              playsInline 
              className="w-full h-auto" 
            >
              Votre navigateur ne supporte pas le tag vidéo.
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <Button
            size="lg"
            className="text-xl px-12 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-2xl"
            onClick={() => navigate('/auth')}
          >
            Accéder aux services
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="text-xl px-12 py-6 border-2 border-purple-400 text-purple-200 hover:bg-purple-900/50 font-bold transition-all duration-300 rounded-2xl"
            onClick={() => navigate('/')}
          >
            <Play className="mr-3 h-6 w-6" />
            En savoir plus
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 text-sm text-gray-400 z-10 relative">
        <p>© 2025 Mairie Services en Ligne. Propulsé par la technologie moderne.</p>
      </footer>
    </div>
  );
};

export default Landing;
