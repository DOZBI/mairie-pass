import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* 404 Animation */}
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 opacity-30 animate-pulse"></div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">
            Page introuvable
          </h2>
          <p className="text-xl text-gray-300">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            size="lg"
            onClick={() => navigate(-1)}
            variant="outline"
            className="text-lg px-8 py-6 border-2 border-purple-400 text-purple-200 hover:bg-purple-900/50 font-bold transition-all duration-300 rounded-2xl"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour
          </Button>
          
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 rounded-2xl"
          >
            <Home className="mr-2 h-5 w-5" />
            Page d'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
