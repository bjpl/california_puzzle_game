import React from 'react';
import { motion } from 'framer-motion';
import { useStudyStore } from '../../stores/studyStore';
import { allCaliforniaCounties, californiaRegions } from '../../data/californiaCountiesComplete';

interface StudyProgressProps {
  compact?: boolean;
  showDetails?: boolean;
}

const StudyProgress: React.FC<StudyProgressProps> = ({
  compact = false,
  showDetails = true
}) => {
  const { progress, getRegionProgress, getSpacedRepetitionStatus } = useStudyStore();

  const totalCounties = allCaliforniaCounties.length;
  const studiedPercentage = (progress.totalStudied / totalCounties) * 100;
  const masteredPercentage = (progress.masteredCounties.size / totalCounties) * 100;

  const upcomingReviews = getSpacedRepetitionStatus().filter(
    item => item.nextReview <= new Date()
  ).length;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Study Progress</h3>
            <p className="text-sm text-gray-600">
              {progress.totalStudied} of {totalCounties} counties studied
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(studiedPercentage)}%
            </div>
            {upcomingReviews > 0 && (
              <p className="text-xs text-orange-600">
                {upcomingReviews} due for review
              </p>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${studiedPercentage}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Learning Progress</h2>

      {/* Overall Progress */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {progress.totalStudied}
          </div>
          <div className="text-sm text-gray-600">Counties Studied</div>
          <div className="text-xs text-gray-500">of {totalCounties} total</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {progress.masteredCounties.size}
          </div>
          <div className="text-sm text-gray-600">Counties Mastered</div>
          <div className="text-xs text-gray-500">{Math.round(masteredPercentage)}% mastery</div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {upcomingReviews}
          </div>
          <div className="text-sm text-gray-600">Due for Review</div>
          <div className="text-xs text-gray-500">spaced repetition</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Study Progress</span>
            <span>{Math.round(studiedPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${studiedPercentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Mastery Level</span>
            <span>{Math.round(masteredPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-green-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${masteredPercentage}%` }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Region Breakdown */}
      {showDetails && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress by Region</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(californiaRegions).map(([regionName, counties]) => {
              const regionProgress = getRegionProgress(regionName);
              const percentage = (regionProgress.studied / regionProgress.total) * 100;

              return (
                <motion.div
                  key={regionName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * Object.keys(californiaRegions).indexOf(regionName) }}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700 text-sm">{regionName}</span>
                    <span className="text-xs text-gray-500">
                      {regionProgress.studied}/{regionProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learning Streak */}
      {progress.currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 border border-orange-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="font-semibold text-gray-800">
                {progress.currentStreak} Day Learning Streak!
              </div>
              <div className="text-sm text-gray-600">
                Keep studying to maintain your streak
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StudyProgress;