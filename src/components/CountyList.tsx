import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface County {
  id: string;
  name: string;
  isPlaced?: boolean;
  isCorrect?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  region?: string;
}

interface CountyListProps {
  counties: County[];
  onCountySelect?: (county: County) => void;
  selectedCounty?: County | null;
  showProgress?: boolean;
  groupByRegion?: boolean;
  searchTerm?: string;
  sortBy?: 'name' | 'difficulty' | 'status';
  className?: string;
}

const CountyList: React.FC<CountyListProps> = ({
  counties,
  onCountySelect,
  selectedCounty,
  showProgress = true,
  groupByRegion = false,
  searchTerm = '',
  sortBy = 'name',
  className = ''
}) => {
  const [filteredCounties, setFilteredCounties] = useState<County[]>([]);
  const [groupedCounties, setGroupedCounties] = useState<Record<string, County[]>>({});

  // Filter and sort counties
  useEffect(() => {
    let filtered = counties.filter(county =>
      county.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort counties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return (difficultyOrder[a.difficulty || 'medium'] || 2) -
                 (difficultyOrder[b.difficulty || 'medium'] || 2);
        case 'status':
          if (a.isPlaced !== b.isPlaced) return a.isPlaced ? 1 : -1;
          if (a.isCorrect !== b.isCorrect) return a.isCorrect ? 1 : -1;
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredCounties(filtered);

    // Group by region if needed
    if (groupByRegion) {
      const grouped = filtered.reduce((acc, county) => {
        const region = county.region || 'Other';
        if (!acc[region]) acc[region] = [];
        acc[region].push(county);
        return acc;
      }, {} as Record<string, County[]>);
      setGroupedCounties(grouped);
    }
  }, [counties, searchTerm, sortBy, groupByRegion]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 200
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (county: County) => {
    if (county.isPlaced && county.isCorrect) {
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    } else if (county.isPlaced && !county.isCorrect) {
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const CountyItem: React.FC<{ county: County; index: number }> = ({ county, index }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-colors
        ${selectedCounty?.id === county.id
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
        }
        ${county.isPlaced && county.isCorrect ? 'opacity-60' : ''}
      `}
      onClick={() => onCountySelect?.(county)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getStatusIcon(county)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {county.name}
            </h3>
            {county.region && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {county.region}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {county.difficulty && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(county.difficulty)}`}>
              {county.difficulty}
            </span>
          )}

          {selectedCounty?.id === county.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 bg-blue-500 rounded-full"
            />
          )}
        </div>
      </div>

      {/* Drag indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-30">
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>
    </motion.div>
  );

  const progress = counties.filter(c => c.isPlaced && c.isCorrect).length;
  const total = counties.length;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      {showProgress && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {progress} / {total}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(progress / total) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      )}

      {/* County List */}
      {groupByRegion ? (
        <div className="space-y-6">
          {Object.entries(groupedCounties).map(([region, regionCounties]) => (
            <motion.div
              key={region}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {region}
              </h3>
              <motion.div
                className="grid gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {regionCounties.map((county, index) => (
                    <CountyItem
                      key={county.id}
                      county={county}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredCounties.map((county, index) => (
              <CountyItem
                key={county.id}
                county={county}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredCounties.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">
            No counties found matching your search.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CountyList;