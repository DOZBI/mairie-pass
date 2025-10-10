import { FileText, Lock, Clock, Hammer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const Cover = () => {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // ⚡ Joue le son du marteau
    const hammerSound = new Audio("/sounds/hammer-hit.mp3"); // 🔊 Ton fichier son
    hammerSound.volume = 0.4; // volume modéré
    hammerSound.play().catch(() => {}); // empêche les erreurs de lecture auto

    // ⏱️ Lance la transition automatique après 3,5 secondes
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        navigate("/landing");
      }, 700);
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence mode="wait">
      {!isLeaving && (
        <motion.div
          key="cover"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-950 text-white px-6 text-center overflow-hidden"
        >
          {/* Logo principal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 10,
              delay: 0.3,
            }}
            className="mb-10 relative"
          >
            <div className="flex items-center justify-center w-40 h-40 rounded-full bg-green-500/10 border border-green-400/30 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <FileText className="h-20 w-20 text-green-400 animate-pulse" />
            </div>

            {/* Petites icônes flottantes */}
            <motion.div
              className="absolute -top-4 -left-8 bg-green-500/20 p-3 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              <Lock className="h-6 w-6 text-green-400" />
            </motion.div>
            <motion.div
              className="absolute top-0 -right-8 bg-green-500/20 p-3 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
            >
              <Clock className="h-6 w-6 text-green-400" />
            </motion.div>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-3xl font-bold mb-4"
          >
            Bienvenue sur <span className="text-green-400">MairiePass</span>
          </motion.h1>

          {/* Sous-texte */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-gray-300 text-base max-w-sm mb-10"
          >
            Vos démarches administratives, <br /> simples, rapides et sécurisées.
          </motion.p>

          {/* Icône marteau animée */}
          <motion.div
            initial={{ rotate: 0, scale: 1 }}
            animate={{ rotate: [0, -20, 20, 0], scale: [1, 1.1, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="mt-4 mb-8 text-green-400"
          >
            <Hammer className="w-10 h-10" />
          </motion.div>

          {/* Barre de progression */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ delay: 1, duration: 2.2, ease: "easeInOut" }}
            className="h-1 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] mb-6"
          />

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-10 text-sm text-gray-500"
          >
            © 2025 MairiePass • Tous droits réservés
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Cover;
                      
