import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Dices, Trophy, ChevronRight } from "lucide-react";

const Cover = () => {
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FDF2F2] flex flex-col items-center justify-between py-16 px-8 overflow-hidden font-sans">
      
      {/* Background Decor - Subtiles lueurs rouges Apple */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-200/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-100/50 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {!isLeaving && (
          <>
            {/* Logo Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative mt-20"
            >
              <div className="relative w-40 h-40 bg-white rounded-[40px] shadow-2xl shadow-red-200 flex items-center justify-center border border-white">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Dices size={80} className="text-red-600" strokeWidth={1.5} />
                </motion.div>
                
                {/* Petites icônes flottantes minimalistes */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-yellow-400 p-3 rounded-2xl shadow-lg text-white"
                >
                  <Trophy size={20} />
                </motion.div>
              </div>
              
              {/* Effet de brillance derrière le logo */}
              <div className="absolute inset-0 bg-red-500/10 blur-3xl -z-10 rounded-full scale-150" />
            </motion.div>

            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center z-10"
            >
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">
                Loto<span className="text-red-600">Pass</span>
              </h1>
              <div className="flex items-center justify-center gap-2 text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                <Sparkles size={12} className="text-red-500" />
                Premium Gaming Experience
                <Sparkles size={12} className="text-red-500" />
              </div>
            </motion.div>

            {/* Bottom Section & Button */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full max-w-xs space-y-8"
            >
              <div className="space-y-4 text-center">
                <p className="text-gray-500 text-sm leading-relaxed px-4">
                  Découvrez une nouvelle façon de jouer au loto. Simple, rapide et sécurisé.
                </p>
              </div>

              <button
                onClick={handleEnter}
                className="group relative w-full h-16 bg-red-600 rounded-[24px] flex items-center justify-center gap-3 text-white font-bold text-lg shadow-xl shadow-red-200 active:scale-95 transition-all overflow-hidden"
              >
                <span className="relative z-10">Commencer</span>
                <ChevronRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                
                {/* Effet de reflet qui passe sur le bouton */}
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                />
              </button>

              <p className="text-[10px] text-center text-gray-300 font-bold uppercase tracking-widest">
                © 2025 LotoPass Studio
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isLeaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-red-600 z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 text-white"
            >
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="font-bold tracking-widest uppercase text-xs">Préparation de vos gains...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cover;
                    
