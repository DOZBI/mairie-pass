import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cover = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-block p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl">
              <FileText className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in">
            Services d'État Civil
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 animate-fade-in">
            Mairie - Documents en Ligne
          </p>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto animate-fade-in">
            Demandez vos documents officiels en quelques clics. 
            Rapide, sécurisé et disponible 24/7.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate('/landing')}
            >
              Commencer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300"
              onClick={() => navigate('/auth')}
            >
              Se connecter
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
              <div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl mb-4">
                <Clock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                Rapide
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Recevez vos documents en quelques jours seulement
              </p>
            </div>

            <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
              <div className="inline-block p-3 bg-purple-100 dark:bg-purple-900/40 rounded-xl mb-4">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                Sécurisé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vos données sont protégées avec un cryptage de niveau bancaire
              </p>
            </div>

            <div className="p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in">
              <div className="inline-block p-3 bg-pink-100 dark:bg-pink-900/40 rounded-xl mb-4">
                <FileText className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                Simple
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Interface intuitive et processus de demande simplifié
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 dark:text-gray-400">
        <p className="text-sm">© 2025 Mairie Services en Ligne. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default Cover;
