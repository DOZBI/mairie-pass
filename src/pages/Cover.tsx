import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Composant principal
const Cover = () => {
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ⏱️ Lance la transition automatique après 3,5 secondes
    const leavingTimer = setTimeout(() => {
      setIsLeaving(true);
    }, 3500);

    // 🚀 Redirige après l'animation de sortie
    const navigateTimer = setTimeout(() => {
      navigate("/dashboard");
    }, 4200); // 3500ms pour le délai initial + 700ms pour l'animation de fondu

    return () => {
      clearTimeout(leavingTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  // Icône Dices (Dés)
  const DicesIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
      <circle cx="7" cy="7" r="0.5" fill="currentColor" />
      <circle cx="17" cy="17" r="0.5" fill="currentColor" />
      <circle cx="15" cy="15" r="0.5" fill="currentColor" />
      <circle cx="19" cy="19" r="0.5" fill="currentColor" />
      <circle cx="15" cy="19" r="0.5" fill="currentColor" />
      <circle cx="19" cy="15" r="0.5" fill="currentColor" />
    </svg>
  );

  // Icône Star (Étoile)
  const StarIcon = ({ className = "w-6 h-6", filled = false }) => (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );

  // Icône Trophy (Trophée)
  const TrophyIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );

  // Icône Sparkles (Étincelles)
  const SparklesIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );

  if (isLeaving) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-rose-950 text-white animate-fade-out">
        <p className="text-2xl">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-rose-950 text-white px-6 text-center overflow-hidden relative animate-fade-in">
      {/* Effets de fond animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl animate-pulse-slower" />

        {/* Particules d'étoiles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <SparklesIcon className="h-4 w-4 text-white" />
          </div>
        ))}
      </div>

      {/* Logo principal avec effet glassmorphism */}
      <div className="mb-12 relative z-10 animate-scale-in" style={{ animationDelay: '0.3s' }}>
        {/* Cercle extérieur avec glow */}
        <div className="absolute inset-0 w-44 h-44 rounded-full bg-gradient-to-br from-red-400/30 to-rose-600/30 blur-xl animate-pulse" />

        <div className="relative flex items-center justify-center w-44 h-44 rounded-full bg-gradient-to-br from-white/20 to-red-900/40 border-2 border-white/40 backdrop-blur-xl shadow-[0_0_50px_rgba(248,113,113,0.5)]">
          <div className="animate-spin-slow">
            <DicesIcon className="h-24 w-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          </div>
        </div>

        {/* Petites icônes flottantes */}
        <div className="absolute -top-6 -left-10 bg-gradient-to-br from-white/30 to-red-500/30 p-4 rounded-full border border-white/30 backdrop-blur-md shadow-lg animate-float">
          <StarIcon className="h-7 w-7 text-yellow-300" filled={true} />
        </div>
        <div className="absolute -top-2 -right-10 bg-gradient-to-br from-yellow-500/30 to-red-600/30 p-4 rounded-full border border-yellow-400/30 backdrop-blur-md shadow-lg animate-float-delayed">
          <TrophyIcon className="h-7 w-7 text-yellow-300" />
        </div>
      </div>

      {/* Titre principal */}
      <h1 className="text-5xl md:text-6xl font-bold mb-6 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        Bienvenue sur{" "}
        <span className="bg-gradient-to-r from-white via-red-100 to-white text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-gradient">
          LotoPass
        </span>
      </h1>

      {/* Sous-texte */}
      <p className="text-red-100 text-lg md:text-xl max-w-md mb-12 leading-relaxed relative z-10 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        Votre chance de gagner commence ici ! <br />
        <span className="text-white font-semibold">Jouez</span>, <span className="text-yellow-300 font-semibold">gagnez</span> et <span className="text-white font-semibold">célébrez</span> !
      </p>

      {/* Icône dés centrale */}
      <div className="mt-2 mb-10 relative z-10 animate-fade-in-up" style={{ animationDelay: '1s' }}>
        <div className="relative">
          <div className="absolute inset-0 blur-xl animate-pulse">
            <DicesIcon className="w-12 h-12 text-white" />
          </div>
          <div className="animate-bounce-slow">
            <DicesIcon className="w-12 h-12 text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,1)]" />
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="relative w-72 h-2 bg-red-950/50 rounded-full overflow-hidden mb-8 backdrop-blur-sm border border-red-700/30 z-10">
        <div className="h-full bg-gradient-to-r from-white via-red-200 to-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-progress">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Texte d'encouragement */}
      <div className="text-yellow-300 font-semibold text-lg mb-6 relative z-10 animate-fade-in" style={{ animationDelay: '1.5s' }}>
        🎰 Tentez votre chance maintenant ! 🎰
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-8 text-sm text-red-200 relative z-10 animate-fade-in" style={{ animationDelay: '1.8s' }}>
        <div className="flex items-center gap-2 justify-center">
          <span>© 2025 LotoPass</span>
          <span className="text-white">•</span>
          <span>Jouez responsablement</span>
        </div>
      </footer>

      {/* Styles CSS inline */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5) rotateY(180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.4;
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        @keyframes progress {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);
          }
        }

        @keyframes shimmer {
          from {
            background-position: 0%;
          }
          to {
            background-position: 100%;
          }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0%; }
          50% { background-position: 100%; }
        }

        .animate-fade-in {
          animation: fade-in 0.7s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-in {
          animation: scale-in 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 2.5s ease-in-out 0.5s infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 5s ease-in-out 1s infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 2.5s ease-out 1s forwards;
          transform: translateX(-100%);
          background-size: 200% 100%;
        }

        .animate-shimmer {
          animation: shimmer 1.5s linear infinite;
          background-size: 200% 100%;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s linear infinite;
        }

        .animate-fade-out {
          animation: fade-in 0.7s ease-out reverse;
        }
      `}</style>
    </div>
  );
};

export default Cover;
