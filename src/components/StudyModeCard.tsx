import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountyData {
  name: string;
  population?: number;
  area?: number;
  established?: string;
  seat?: string;
  facts?: string[];
  image?: string;
}

interface StudyModeCardProps {
  county: CountyData;
  isFlipped?: boolean;
  onFlip?: () => void;
  autoFlip?: boolean;
  flipDelay?: number;
  className?: string;
}

const StudyModeCard: React.FC<StudyModeCardProps> = ({
  county,
  isFlipped: controlledFlipped,
  onFlip,
  autoFlip = false,
  flipDelay = 3000,
  className = ''
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  // Auto flip functionality
  React.useEffect(() => {
    if (autoFlip) {
      const timer = setInterval(() => {
        setInternalFlipped(prev => !prev);
      }, flipDelay);

      return () => clearInterval(timer);
    }
  }, [autoFlip, flipDelay]);

  const handleFlip = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  const cardVariants = {
    front: {
      rotateY: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        duration: 0.6
      }
    },
    back: {
      rotateY: 180,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 100,
        duration: 0.6
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotateY: 180
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        delay: 0.3,
        duration: 0.3
      }
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div
      className={`relative w-80 h-96 perspective-1000 cursor-pointer ${className}`}
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d"
        animate={isFlipped ? 'back' : 'front'}
        variants={cardVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-4 text-white">
              <h3 className="text-2xl font-bold text-center">{county.name}</h3>
              <p className="text-center text-red-100 text-sm">County</p>
            </div>

            {/* County Image or Icon */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-700">
              {county.image ? (
                <img
                  src={county.image}
                  alt={`${county.name} County`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="p-4 bg-white dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {county.population && (
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Population</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatNumber(county.population)}
                    </p>
                  </div>
                )}
                {county.seat && (
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">County Seat</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{county.seat}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Flip Indicator */}
            <div className="absolute bottom-2 right-2 text-gray-400 dark:text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                className="flex flex-col h-full"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                  <h3 className="text-xl font-bold text-center">{county.name} Details</h3>
                </div>

                {/* Detailed Information */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {county.established && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Established
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">{county.established}</p>
                      </div>
                    )}

                    {county.area && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Area
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {formatNumber(county.area)} square miles
                        </p>
                      </div>
                    )}

                    {county.facts && county.facts.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Interesting Facts
                        </h4>
                        <ul className="space-y-2">
                          {county.facts.map((fact, index) => (
                            <motion.li
                              key={index}
                              className="text-gray-600 dark:text-gray-300 text-sm flex items-start"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <span className="text-blue-500 mr-2 mt-1 flex-shrink-0">•</span>
                              <span>{fact}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Indicator */}
                <div className="absolute bottom-2 right-2 text-gray-400 dark:text-gray-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 9H17a1 1 0 110 2h-5.586l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudyModeCard;