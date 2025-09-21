import React, { useState, useEffect } from 'react';
import { County, CaliforniaRegion } from '@/types';
import { CaliforniaButton } from './CaliforniaButton';
import { getCountiesByRegion, getCountyById } from '@/utils/californiaData';

interface StudyModeProps {
  counties: string[]; // County IDs to study
  onStudyComplete: () => void;
  onCountySelect?: (county: County) => void;
  className?: string;
}

interface CountyStudyInfo {
  county: County;
  isStudied: boolean;
  studyTime: number; // milliseconds spent studying
  interactionCount: number;
}

export const StudyMode: React.FC<StudyModeProps> = ({
  counties,
  onStudyComplete,
  onCountySelect,
  className = ''
}) => {
  const [studyProgress, setStudyProgress] = useState<CountyStudyInfo[]>([]);
  const [currentCountyIndex, setCurrentCountyIndex] = useState(0);
  const [studyStartTime, setStudyStartTime] = useState<number>(Date.now());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  // Initialize study progress
  useEffect(() => {
    const initialProgress = counties
      .map(id => getCountyById(id))
      .filter((county): county is County => county !== undefined)
      .map(county => ({
        county,
        isStudied: false,
        studyTime: 0,
        interactionCount: 0
      }));

    setStudyProgress(initialProgress);
    setStudyStartTime(Date.now());
  }, [counties]);

  const currentCounty = studyProgress[currentCountyIndex]?.county;
  const totalStudyTime = studyProgress.reduce((sum, info) => sum + info.studyTime, 0);
  const studiedCount = studyProgress.filter(info => info.isStudied).length;
  const allStudied = studiedCount === studyProgress.length;

  // Mark current county as studied after minimum time
  useEffect(() => {
    if (!currentCounty) return;

    const minStudyTime = 3000; // 3 seconds minimum
    const timer = setTimeout(() => {
      setStudyProgress(prev => prev.map((info, index) =>
        index === currentCountyIndex
          ? {
              ...info,
              isStudied: true,
              studyTime: Date.now() - studyStartTime,
              interactionCount: info.interactionCount + 1
            }
          : info
      ));
    }, minStudyTime);

    return () => clearTimeout(timer);
  }, [currentCountyIndex, currentCounty, studyStartTime]);

  const handleNextCounty = () => {
    if (currentCountyIndex < studyProgress.length - 1) {
      setCurrentCountyIndex(prev => prev + 1);
      setStudyStartTime(Date.now());
    } else if (allStudied) {
      setShowQuiz(true);
    }
  };

  const handlePrevCounty = () => {
    if (currentCountyIndex > 0) {
      setCurrentCountyIndex(prev => prev - 1);
      setStudyStartTime(Date.now());
    }
  };

  const handleCountyInteraction = () => {
    setStudyProgress(prev => prev.map((info, index) =>
      index === currentCountyIndex
        ? { ...info, interactionCount: info.interactionCount + 1 }
        : info
    ));

    if (onCountySelect && currentCounty) {
      onCountySelect(currentCounty);
    }
  };

  const generateCountyFacts = (county: County): string[] => {
    const facts = [];

    if (county.population) {
      facts.push(`Population: ${county.population.toLocaleString()} people`);
    }

    if (county.area) {
      facts.push(`Area: ${county.area.toLocaleString()} square miles`);
    }

    // Add region-specific facts
    switch (county.region) {
      case CaliforniaRegion.BAY_AREA:
        facts.push('Part of the San Francisco Bay Area');
        break;
      case CaliforniaRegion.SOUTHERN:
        facts.push('Located in Southern California');
        break;
      case CaliforniaRegion.CENTRAL_VALLEY:
        facts.push('Part of California\'s agricultural Central Valley');
        break;
      case CaliforniaRegion.COASTAL:
        facts.push('Located along the Pacific Coast');
        break;
      case CaliforniaRegion.NORTHERN:
        facts.push('Part of Northern California');
        break;
    }

    // Add difficulty-based tips
    switch (county.difficulty) {
      case 'easy':
        facts.push('💡 Large and recognizable shape - good for beginners!');
        break;
      case 'medium':
        facts.push('💡 Medium difficulty - pay attention to the shape');
        break;
      case 'hard':
        facts.push('💡 Challenging shape - look for distinctive features');
        break;
      case 'expert':
        facts.push('💡 Expert level - study the borders carefully');
        break;
    }

    return facts;
  };

  const renderStudyCard = () => {
    if (!currentCounty) return null;

    const facts = generateCountyFacts(currentCounty);
    const progress = studyProgress[currentCountyIndex];

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentCounty.name} County</h2>
            <p className="text-gray-600">FIPS Code: {currentCounty.fips}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {currentCountyIndex + 1} of {studyProgress.length}
            </div>
            <div className={`text-xs px-2 py-1 rounded ${
              progress?.isStudied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {progress?.isStudied ? 'Studied' : 'Studying...'}
            </div>
          </div>
        </div>

        {/* County Shape Visualization */}
        <div
          className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={handleCountyInteraction}
        >
          <div className="text-center">
            <div className="text-6xl mb-2">📍</div>
            <div className="text-sm text-blue-700">
              Click to see {currentCounty.name} County on the map
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Interactions: {progress?.interactionCount || 0}
            </div>
          </div>
        </div>

        {/* County Facts */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-900">Key Information</h3>
          {facts.map((fact, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-gray-700">{fact}</span>
            </div>
          ))}
        </div>

        {/* Study Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-yellow-800 mb-2">Study Tips</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Look for distinctive geographic features</li>
            <li>• Notice how it connects to neighboring counties</li>
            <li>• Remember its location relative to major cities</li>
            <li>• Pay attention to its overall shape and size</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <CaliforniaButton
            variant="secondary"
            onClick={handlePrevCounty}
            disabled={currentCountyIndex === 0}
          >
            ← Previous
          </CaliforniaButton>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              Study time: {Math.floor((Date.now() - studyStartTime) / 1000)}s
            </div>
          </div>

          <CaliforniaButton
            variant="primary"
            onClick={handleNextCounty}
          >
            {currentCountyIndex === studyProgress.length - 1
              ? (allStudied ? 'Take Quiz' : 'Finish Study')
              : 'Next →'
            }
          </CaliforniaButton>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showQuizResult, setShowQuizResult] = useState(false);

    const quizQuestions = studyProgress.map(info => {
      const correctAnswer = info.county.name;
      const wrongAnswers = studyProgress
        .filter(other => other.county.id !== info.county.id)
        .slice(0, 3)
        .map(other => other.county.name);

      return {
        county: info.county,
        question: `Which county is this?`,
        options: [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5),
        correctAnswer
      };
    });

    const currentQuestion = quizQuestions[currentQuizIndex];

    const handleQuizAnswer = (answer: string) => {
      setSelectedAnswer(answer);
      setShowQuizResult(true);

      const isCorrect = answer === currentQuestion.correctAnswer;
      setQuizScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));

      setTimeout(() => {
        if (currentQuizIndex < quizQuestions.length - 1) {
          setCurrentQuizIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setShowQuizResult(false);
        } else {
          // Quiz complete
          onStudyComplete();
        }
      }, 2000);
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Knowledge Check</h2>
          <p className="text-gray-600">Question {currentQuizIndex + 1} of {quizQuestions.length}</p>
          <div className="text-sm text-gray-500">
            Score: {quizScore.correct}/{quizScore.total}
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-lg font-medium text-gray-900">{currentQuestion.question}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, index) => (
            <CaliforniaButton
              key={index}
              variant={
                showQuizResult
                  ? option === currentQuestion.correctAnswer
                    ? 'primary'
                    : option === selectedAnswer
                    ? 'danger'
                    : 'secondary'
                  : 'secondary'
              }
              onClick={() => !showQuizResult && handleQuizAnswer(option)}
              disabled={showQuizResult}
              className="w-full p-4 text-left"
            >
              {option}
              {showQuizResult && option === currentQuestion.correctAnswer && ' ✓'}
              {showQuizResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && ' ✗'}
            </CaliforniaButton>
          ))}
        </div>

        {showQuizResult && (
          <div className={`mt-4 p-4 rounded-lg ${
            selectedAnswer === currentQuestion.correctAnswer
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {selectedAnswer === currentQuestion.correctAnswer
              ? '🎉 Correct!'
              : `❌ Incorrect. The answer is ${currentQuestion.correctAnswer}.`
            }
          </div>
        )}
      </div>
    );
  };

  const renderProgress = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Study Progress</h3>
        <span className="text-sm text-gray-600">
          {studiedCount}/{studyProgress.length} counties studied
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        {studyProgress.map((info, index) => (
          <div
            key={info.county.id}
            className={`flex-1 h-2 rounded ${
              info.isStudied
                ? 'bg-green-500'
                : index === currentCountyIndex
                ? 'bg-blue-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="text-xs text-gray-500">
        Total study time: {Math.floor(totalStudyTime / 1000)}s
      </div>
    </div>
  );

  if (showQuiz) {
    return (
      <div className={className}>
        {renderQuiz()}
      </div>
    );
  }

  return (
    <div className={className}>
      {renderProgress()}
      {renderStudyCard()}

      {/* Skip Study Option */}
      <div className="text-center mt-6">
        <CaliforniaButton
          variant="outline"
          onClick={onStudyComplete}
          className="text-sm"
        >
          Skip Study Mode
        </CaliforniaButton>
      </div>
    </div>
  );
};