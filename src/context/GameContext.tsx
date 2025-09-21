import React, { createContext, useContext, useState, useEffect } from 'react';
import { californiaCounties } from '../data/californiaCounties';

interface County {
  id: string;
  name: string;
  region: string;
  capital?: string;
  population?: number;
  area?: number;
}

interface GameContextType {
  counties: County[];
  placedCounties: Set<string>;
  currentCounty: County | null;
  score: number;
  mistakes: number;
  isGameComplete: boolean;
  isGameStarted: boolean;
  selectCounty: (county: County) => void;
  placeCounty: (countyId: string, isCorrect: boolean) => void;
  clearCurrentCounty: () => void;
  resetGame: () => void;
  startGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Simplified California counties for the game
  const gameCounties: County[] = [
    { id: 'los-angeles', name: 'Los Angeles', region: 'Southern California' },
    { id: 'san-diego', name: 'San Diego', region: 'Southern California' },
    { id: 'orange', name: 'Orange', region: 'Southern California' },
    { id: 'riverside', name: 'Riverside', region: 'Southern California' },
    { id: 'san-bernardino', name: 'San Bernardino', region: 'Southern California' },
    { id: 'santa-clara', name: 'Santa Clara', region: 'Bay Area' },
    { id: 'alameda', name: 'Alameda', region: 'Bay Area' },
    { id: 'san-francisco', name: 'San Francisco', region: 'Bay Area' },
    { id: 'san-mateo', name: 'San Mateo', region: 'Bay Area' },
    { id: 'contra-costa', name: 'Contra Costa', region: 'Bay Area' },
    { id: 'sacramento', name: 'Sacramento', region: 'Central Valley' },
    { id: 'fresno', name: 'Fresno', region: 'Central Valley' },
    { id: 'kern', name: 'Kern', region: 'Central Valley' },
    { id: 'san-joaquin', name: 'San Joaquin', region: 'Central Valley' },
    { id: 'stanislaus', name: 'Stanislaus', region: 'Central Valley' },
    { id: 'ventura', name: 'Ventura', region: 'Central Coast' },
    { id: 'santa-barbara', name: 'Santa Barbara', region: 'Central Coast' },
    { id: 'monterey', name: 'Monterey', region: 'Central Coast' },
    { id: 'san-luis-obispo', name: 'San Luis Obispo', region: 'Central Coast' },
    { id: 'santa-cruz', name: 'Santa Cruz', region: 'Central Coast' },
  ];

  const [counties] = useState<County[]>(gameCounties);
  const [placedCounties, setPlacedCounties] = useState<Set<string>>(new Set());
  const [currentCounty, setCurrentCounty] = useState<County | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    if (placedCounties.size === counties.length && counties.length > 0) {
      setIsGameComplete(true);
    }
  }, [placedCounties, counties]);

  const selectCounty = (county: County) => {
    setCurrentCounty(county);
  };

  const placeCounty = (countyId: string, isCorrect: boolean) => {
    if (isCorrect && currentCounty && currentCounty.id === countyId) {
      setPlacedCounties(prev => new Set([...prev, countyId]));
      setScore(prev => prev + 100);
      setCurrentCounty(null);
    } else {
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 10));
    }
  };

  const clearCurrentCounty = () => {
    setCurrentCounty(null);
  };

  const resetGame = () => {
    setPlacedCounties(new Set());
    setCurrentCounty(null);
    setScore(0);
    setMistakes(0);
    setIsGameComplete(false);
    setIsGameStarted(true);
  };

  const startGame = () => {
    setIsGameStarted(true);
  };

  return (
    <GameContext.Provider
      value={{
        counties,
        placedCounties,
        currentCounty,
        score,
        mistakes,
        isGameComplete,
        isGameStarted,
        selectCounty,
        placeCounty,
        clearCurrentCounty,
        resetGame,
        startGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}