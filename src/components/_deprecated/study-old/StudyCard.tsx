import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { County } from '../../data/californiaCountiesComplete';

interface StudyCardProps {
  county: County;
  onStudied: (countyId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  onNext: () => void;
  onPrevious: () => void;
  showControls?: boolean;
  autoFlip?: boolean;
  flipDelay?: number;
}

const StudyCard: React.FC<StudyCardProps> = ({
  county,
  onStudied,
  onNext,
  onPrevious,
  showControls = true,
  autoFlip = false,
  flipDelay = 3000
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userRating, setUserRating] = useState<'easy' | 'medium' | 'hard' | null>(null);

  React.useEffect(() => {
    setIsFlipped(false);
    setUserRating(null);

    if (autoFlip) {
      const timer = setTimeout(() => {
        setIsFlipped(true);
      }, flipDelay);

      return () => clearTimeout(timer);
    }
  }, [county.id, autoFlip, flipDelay]);

  const handleFlip = () => {
    if (!autoFlip) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleRating = (rating: 'easy' | 'medium' | 'hard') => {
    setUserRating(rating);
    onStudied(county.id, rating);
  };

  const formatPopulation = (population: number) => {
    if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(0)}K`;
    }
    return population.toString();
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString()} sq mi`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="relative h-96 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <motion.div
          className="relative w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center'
          }}
        >
          {/* Front of card */}
          <motion.div
            className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)'
            }}
          >
            <div className="p-6 h-full flex flex-col justify-center items-center text-white text-center">
              <div className="mb-4">
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${county.difficulty === 'easy' ? 'bg-green-500' :
                    county.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
                `}>
                  {county.difficulty.toUpperCase()}
                </span>
              </div>

              <h2 className="text-3xl font-bold mb-2">{county.name}</h2>
              <p className="text-xl opacity-90 mb-4">{county.region}</p>

              <div className="text-lg opacity-75">
                Tap to reveal details
              </div>

              <div className="mt-4 text-sm opacity-60">
                Founded: {county.founded}
              </div>
            </div>
          </motion.div>

          {/* Back of card */}
          <motion.div
            className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-green-500 to-green-700 shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="p-6 h-full flex flex-col text-white">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{county.name}</h2>
                <span className={`
                  inline-block px-2 py-1 rounded text-xs font-medium
                  ${county.difficulty === 'easy' ? 'bg-green-600' :
                    county.difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'}
                `}>
                  {county.difficulty.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <strong>Capital:</strong> {county.capital}
                </div>

                <div>
                  <strong>Region:</strong> {county.region}
                </div>

                <div>
                  <strong>Population:</strong> {formatPopulation(county.population)}
                </div>

                <div>
                  <strong>Area:</strong> {formatArea(county.area)}
                </div>

                <div>
                  <strong>Founded:</strong> {county.founded}
                </div>

                <div className="bg-white/20 rounded-lg p-3 mt-4">
                  <strong className="block mb-1">Fun Fact:</strong>
                  <p className="text-sm">{county.funFact}</p>
                </div>
              </div>

              {/* Rating buttons */}
              {isFlipped && showControls && (
                <div className="mt-4">
                  <p className="text-sm mb-2 opacity-90">How well do you know this county?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating('hard');
                      }}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors
                        ${userRating === 'hard'
                          ? 'bg-red-600 text-white'
                          : 'bg-white/20 hover:bg-white/30'}`}
                    >
                      Need Review
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating('medium');
                      }}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors
                        ${userRating === 'medium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-white/20 hover:bg-white/30'}`}
                    >
                      Good
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRating('easy');
                      }}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors
                        ${userRating === 'easy'
                          ? 'bg-green-600 text-white'
                          : 'bg-white/20 hover:bg-white/30'}`}
                    >
                      Know Well
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Navigation controls */}
      {showControls && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onPrevious}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <span>←</span>
            <span>Previous</span>
          </button>

          <div className="text-center">
            <button
              onClick={handleFlip}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {isFlipped ? 'Show Front' : 'Show Details'}
            </button>
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyCard;