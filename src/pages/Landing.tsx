import { ArrowRight, FileText, Hammer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleNext = () => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate("/auth");
    }, 700);
  };

  // Effet d’apparition automatique du contenu
  useEffect(() => {
    const timer = setTimeout(() => {
      // Optionnel : auto-transition après quelques secondes
      // navigate("/auth");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence mode="wait">
      {!isLeaving && (
        <motion.div
          key="landing"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-black via-gray-900 to-green-950 text-white px-6 py-10 relative overflow-hidden"
        >
          {/* Barre supérieure : progression */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="w-full flex justify-between items-center text-gray-400 text-sm"
          >
            <span>2/3</span>
            <button
              onClick={() => navigate("/auth")}
              className="hover:text-green-400 transition-colors"
            >
              Passer
            </button>
          </motion.div>

          {/* Contenu principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col items-center justify-center flex-grow text-center"
          >
            {/* Icônes animées */}
            <div className="relative mb-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex items-center justify-center w-44 h-44 rounded-full bg-green-500/10 border border-green-400/30 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                <FileText className="w-16 h-16 text-green-400 animate-pulse" />
              </motion.div>

              {/* Marteau flottant */}
              <motion.div
                className="absolute -top-4 -right-8 bg-green-500/20 p-3 rounded-full"
                animate={{ y: [0, -8, 0], rotate: [0, -15, 15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
              >
                <Hammer className="h-8 w-8 text-green-400" />
              </motion.div>
            </div>

            {/* Titre principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-3xl font-bold mb-4"
            >
              Découvrez <span className="text-green-400">MairiePass</span>
            </motion.h1>

            {/* Description du logiciel */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-gray-300 text-base max-w-md mb-10 leading-relaxed"
            >
              <strong>MairiePass</strong> est une application mobile moderne conçue
              pour faciliter toutes vos démarches administratives locales.
              <br />
              <br />
              📄 Accédez à vos documents officiels, demandez vos certificats,
              suivez vos requêtes en temps réel, et restez informé des services
              de votre mairie — le tout depuis votre téléphone.
              <br />
              <br />
              ⚖️ Sécurisée, rapide et intuitive, MairiePass vous rapproche de vos
              services publics.
            </motion.p>
          </motion.div>

          {/* Bouton rond animé */}
          <motion.button
            onClick={handleNext}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 120 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500 text-black shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:shadow-[0_0_40px_rgba(34,197,94,0.8)] transition-all duration-300 mb-6"
          >
            <ArrowRight className="w-6 h-6" />
          </motion.button>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-4 text-sm text-gray-500"
          >
            © 2025 MairiePass • Vos services, à portée de main
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Landing;
