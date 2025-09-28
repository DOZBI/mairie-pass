import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Scale, User, Shield, ChevronRight, Sparkles } from 'lucide-react';

interface CoverProps {
  onComplete: () => void;
}

const Cover: React.FC<CoverProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const steps = [
    {
      title: "Documents Civils",
      subtitle: "Votre service numérique de confiance",
      description: "Demandez vos documents officiels en quelques clics",
      icon: Scale,
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "Rapide & Sécurisé",
      subtitle: "Traitement en 24h",
      description: "Vos données sont protégées par un chiffrement de niveau bancaire",
      icon: Shield,
      color: "from-emerald-600 to-teal-600"
    },
    {
      title: "Prêt à Commencer?",
      subtitle: "Accédez à tous vos services",
      description: "Extraits d'acte, casiers judiciaires, certificats...",
      icon: FileText,
      color: "from-purple-600 to-pink-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem('hasSeenCover', 'true');
      onComplete();
    }, 800);
  };

  const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className="absolute"
    >
      {children}
    </motion.div>
  );

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <FloatingElement delay={0}>
          <div className="top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="top-40 right-32 w-24 h-24 bg-purple-500/10 rounded-full blur-lg" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="bottom-32 left-40 w-20 h-20 bg-emerald-500/10 rounded-full blur-md" />
        </FloatingElement>
        <FloatingElement delay={1.5}>
          <div className="bottom-20 right-20 w-36 h-36 bg-pink-500/5 rounded-full blur-2xl" />
        </FloatingElement>
      </div>

      {/* Floating document icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0.5}>
          <FileText className="top-32 left-1/4 w-6 h-6 text-blue-400/30" />
        </FloatingElement>
        <FloatingElement delay={1.2}>
          <Scale className="top-1/3 right-1/4 w-8 h-8 text-purple-400/20" />
        </FloatingElement>
        <FloatingElement delay={2.1}>
          <User className="bottom-1/3 left-1/3 w-5 h-5 text-emerald-400/25" />
        </FloatingElement>
        <FloatingElement delay={0.8}>
          <Shield className="top-1/2 right-1/3 w-7 h-7 text-pink-400/20" />
        </FloatingElement>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Icon with gradient background */}
              <motion.div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r ${currentStepData.color} mb-8 shadow-2xl`}
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.4)",
                    "0 0 0 20px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <currentStepData.icon className="w-12 h-12 text-white" />
              </motion.div>

              {/* Content */}
              <motion.h1 
                className="text-4xl font-bold text-white mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentStepData.title}
              </motion.h1>
              
              <motion.p 
                className="text-xl text-blue-200 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentStepData.subtitle}
              </motion.p>
              
              <motion.p 
                className="text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentStepData.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-blue-400' : 'bg-gray-600'
                }`}
                animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.6, repeat: index === currentStep ? Infinity : 0 }}
              />
            ))}
          </div>

          {/* Action button - appears on last step */}
          <AnimatePresence>
            {currentStep === steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold shadow-2xl group"
                >
                  <span className="mr-2">Commencer</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip option */}
          <motion.button
            onClick={handleComplete}
            className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Passer
          </motion.button>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default Cover;