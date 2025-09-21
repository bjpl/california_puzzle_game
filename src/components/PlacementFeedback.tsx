import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlacementFeedbackProps {
  isCorrect: boolean | null;
  isPerfect?: boolean;
  countyName?: string;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

const PlacementFeedback: React.FC<PlacementFeedbackProps> = ({
  isCorrect,
  isPerfect = false,
  countyName,
  position = { x: 0, y: 0 },
  onComplete
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showName, setShowName] = useState(false);

  // Generate particles for perfect placement
  useEffect(() => {
    if (isPerfect) {
      const newParticles: Particle[] = [];
      const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];

      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: `particle-${i}`,
          x: 0,
          y: 0,
          vx: (Math.random() - 0.5) * 400,
          vy: (Math.random() - 0.5) * 400,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4
        });
      }

      setParticles(newParticles);
      setShowName(true);

      // Clean up particles after animation
      const timer = setTimeout(() => {
        setParticles([]);
        setShowName(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isPerfect, onComplete]);

  // Show county name for correct placement
  useEffect(() => {
    if (isCorrect === true && !isPerfect) {
      setShowName(true);
      const timer = setTimeout(() => {
        setShowName(false);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isCorrect, isPerfect, onComplete]);

  const feedbackVariants = {
    correct: {
      scale: [1, 1.2, 1],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    },
    incorrect: {
      x: [-10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    perfect: {
      scale: [1, 1.3, 1.1],
      rotate: [0, 5, -5, 0],
      opacity: [0, 1, 1],
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const nameRevealVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
        delay: 0.2
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const particleVariants = {
    initial: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0
    },
    animate: (particle: Particle) => ({
      opacity: [1, 1, 0],
      scale: [1, 0.8, 0.3],
      x: particle.vx,
      y: particle.vy,
      transition: {
        duration: 2,
        ease: "easeOut"
      }
    })
  };

  if (isCorrect === null) return null;

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: position.x - 50,
        top: position.y - 50,
        width: 100,
        height: 100
      }}
    >
      {/* Correct Placement Feedback */}
      <AnimatePresence>
        {isCorrect === true && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            variants={feedbackVariants}
            initial="correct"
            animate="correct"
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incorrect Placement Feedback */}
      <AnimatePresence>
        {isCorrect === false && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            variants={feedbackVariants}
            initial={{ opacity: 0 }}
            animate="incorrect"
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Perfect Placement with Particles */}
      <AnimatePresence>
        {isPerfect && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            variants={feedbackVariants}
            initial={{ opacity: 0 }}
            animate="perfect"
            exit={{ opacity: 0 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle Effects */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
              left: '50%',
              top: '50%',
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2
            }}
            variants={particleVariants}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0 }}
            custom={particle}
          />
        ))}
      </AnimatePresence>

      {/* County Name Reveal */}
      <AnimatePresence>
        {showName && countyName && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4"
            variants={nameRevealVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                {countyName} County
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlacementFeedback;