import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, File, FileCheck, FileX, FileImage, FilePlus } from 'lucide-react';

interface CoverPageProps {
  onGetStarted: () => void;
}

const CoverPage = ({ onGetStarted }: CoverPageProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const documentIcons = [
    { icon: FileText, position: { top: '15%', left: '10%' }, delay: '0s' },
    { icon: File, position: { top: '25%', right: '15%' }, delay: '0.5s' },
    { icon: FileCheck, position: { top: '45%', left: '8%' }, delay: '1s' },
    { icon: FileX, position: { top: '60%', right: '12%' }, delay: '1.5s' },
    { icon: FileImage, position: { top: '75%', left: '15%' }, delay: '2s' },
    { icon: FilePlus, position: { top: '35%', right: '8%' }, delay: '2.5s' },
    { icon: FileText, position: { top: '70%', right: '20%' }, delay: '3s' },
    { icon: File, position: { top: '20%', left: '20%' }, delay: '3.5s' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Document Icons Background */}
      {documentIcons.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className="absolute animate-fade-in opacity-10"
            style={{
              ...item.position,
              animationDelay: item.delay,
              animationDuration: '1s',
              animationFillMode: 'forwards'
            }}
          >
            <IconComponent className="h-6 w-6 text-primary/20" />
          </div>
        );
      })}

      {/* Animated Sphere */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
        <div className={`relative transition-all duration-1000 ${mounted ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          {/* Main sphere */}
          <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 shadow-2xl animate-pulse-slow relative">
            {/* Highlight effect */}
            <div className="absolute top-8 left-8 w-24 h-24 bg-white/30 rounded-full blur-xl animate-float"></div>
            {/* Inner glow */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-300/50 to-purple-400/50 animate-spin-slow"></div>
          </div>
          
          {/* Secondary glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 scale-110 animate-pulse-slow"></div>
        </div>
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center px-6 max-w-md mx-auto transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 mt-32">
          Services Civils
        </h1>
        
        <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
          Votre portail numérique pour simplifier vos démarches administratives et accéder rapidement aux services civils.
        </p>
        
        <Button 
          onClick={onGetStarted}
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Commencer
        </Button>
      </div>

      {/* Bottom indicator */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-12 h-1 bg-foreground/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default CoverPage;