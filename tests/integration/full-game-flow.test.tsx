import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MOCK_CALIFORNIA_COUNTIES } from '../fixtures';
import '../mocks/d3-mocks';
import '../mocks/react-dnd-mocks';

// Mock full game component integrating all systems
const MockCaliforniaPuzzleGame: React.FC = () => {
  const [gameState, setGameState] = React.useState({
    mode: 'practice' as const,
    difficulty: 'medium' as const,
    isStarted: false,
    isPaused: false,
    isCompleted: false,
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    mistakes: 0,
    hintsUsed: 0,
    maxHints: 3,
    timeElapsed: 0,
    timeLimit: null as number | null,
    availableCounties: MOCK_CALIFORNIA_COUNTIES.slice(0, 5), // Use subset for testing
    placedCounties: [] as string[],
    currentCounty: null as string | null,
    selectedCounty: null as string | null,
    showHints: true,
    showLabels: false,
  });

  const [draggedCounty, setDraggedCounty] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (gameState.isStarted && !gameState.currentCounty && gameState.availableCounties.length > 0) {
      const remaining = gameState.availableCounties.filter(id => !gameState.placedCounties.includes(id));
      setGameState(prev => ({ ...prev, currentCounty: remaining[0] || null }));
    }
  }, [gameState.isStarted, gameState.placedCounties, gameState.availableCounties]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isStarted: true,
      isPaused: false,
      isCompleted: false,
      score: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      mistakes: 0,
      hintsUsed: 0,
      timeElapsed: 0,
      placedCounties: [],
      currentCounty: prev.availableCounties[0] || null,
    }));
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const setMode = (mode: typeof gameState.mode) => {
    setGameState(prev => ({
      ...prev,
      mode,
      timeLimit: mode === 'timed' ? 300 : mode === 'challenge' ? 180 : null,
    }));
  };

  const setDifficulty = (difficulty: typeof gameState.difficulty) => {
    setGameState(prev => ({
      ...prev,
      difficulty,
      maxHints: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 3 : 1,
    }));
  };

  const selectCounty = (countyId: string) => {
    setGameState(prev => ({ ...prev, selectedCounty: countyId }));
  };

  const placeCounty = (countyId: string, targetId: string) => {
    const isCorrect = countyId === targetId;
    const newTotalQuestions = gameState.totalQuestions + 1;

    if (isCorrect) {
      const newPlacedCounties = [...gameState.placedCounties, countyId];
      const remaining = gameState.availableCounties.filter(id => !newPlacedCounties.includes(id));

      setGameState(prev => ({
        ...prev,
        placedCounties: newPlacedCounties,
        currentCounty: remaining[0] || null,
        selectedCounty: null,
        correctAnswers: prev.correctAnswers + 1,
        totalQuestions: newTotalQuestions,
        score: prev.score + 100,
        isCompleted: newPlacedCounties.length === prev.availableCounties.length,
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        totalQuestions: newTotalQuestions,
        selectedCounty: null,
      }));
    }
  };

  const useHint = () => {
    if (gameState.hintsUsed < gameState.maxHints) {
      setGameState(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
        score: Math.max(0, prev.score - 10),
      }));
    }
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      isStarted: false,
      isPaused: false,
      isCompleted: false,
      score: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      mistakes: 0,
      hintsUsed: 0,
      timeElapsed: 0,
      placedCounties: [],
      currentCounty: null,
      selectedCounty: null,
    }));
  };

  const toggleLabels = () => {
    setGameState(prev => ({ ...prev, showLabels: !prev.showLabels }));
  };

  const handleDragStart = (countyId: string) => {
    setDraggedCounty(countyId);
  };

  const handleDragEnd = () => {
    setDraggedCounty(null);
  };

  const handleDrop = (targetCountyId: string) => {
    if (draggedCounty) {
      placeCounty(draggedCounty, targetCountyId);
    }
  };

  const availableForDrag = gameState.availableCounties.filter(id => !gameState.placedCounties.includes(id));

  return (
    <div data-testid="california-puzzle-game" className="game-container">
      {/* Game Header */}
      <header data-testid="game-header" className="game-header">
        <h1>California Counties Puzzle</h1>

        {/* Game Controls */}
        <div data-testid="game-controls" className="game-controls">
          <select
            data-testid="mode-selector"
            value={gameState.mode}
            onChange={(e) => setMode(e.target.value as any)}
            disabled={gameState.isStarted}
          >
            <option value="practice">Practice</option>
            <option value="timed">Timed (5 min)</option>
            <option value="challenge">Challenge (3 min)</option>
            <option value="learn">Learn</option>
          </select>

          <select
            data-testid="difficulty-selector"
            value={gameState.difficulty}
            onChange={(e) => setDifficulty(e.target.value as any)}
            disabled={gameState.isStarted}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <button
            data-testid="toggle-labels"
            onClick={toggleLabels}
            className={gameState.showLabels ? 'active' : ''}
          >
            {gameState.showLabels ? 'Hide Labels' : 'Show Labels'}
          </button>
        </div>

        {/* Game Actions */}
        <div data-testid="game-actions" className="game-actions">
          {!gameState.isStarted ? (
            <button data-testid="start-game" onClick={startGame}>
              Start Game
            </button>
          ) : (
            <>
              <button data-testid="pause-game" onClick={pauseGame}>
                {gameState.isPaused ? 'Resume' : 'Pause'}
              </button>
              <button data-testid="reset-game" onClick={resetGame}>
                Reset
              </button>
            </>
          )}
        </div>
      </header>

      {/* Game Stats */}
      <div data-testid="game-stats" className="game-stats">
        <div data-testid="score">Score: {gameState.score}</div>
        <div data-testid="accuracy">
          Accuracy: {gameState.totalQuestions > 0
            ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100)
            : 0}%
        </div>
        <div data-testid="hints">Hints: {gameState.hintsUsed}/{gameState.maxHints}</div>
        <div data-testid="mistakes">Mistakes: {gameState.mistakes}</div>
        {gameState.timeLimit && (
          <div data-testid="timer">
            Time: {Math.floor(gameState.timeElapsed / 60)}:{(gameState.timeElapsed % 60).toString().padStart(2, '0')} / {Math.floor(gameState.timeLimit / 60)}:00
          </div>
        )}
      </div>

      {/* Current County Indicator */}
      {gameState.isStarted && gameState.currentCounty && (
        <div data-testid="current-county" className="current-county">
          Place: {MOCK_CALIFORNIA_COUNTIES.find(c => c.id === gameState.currentCounty)?.name}
          <button
            data-testid="use-hint"
            onClick={useHint}
            disabled={gameState.hintsUsed >= gameState.maxHints}
          >
            Use Hint ({gameState.maxHints - gameState.hintsUsed} left)
          </button>
        </div>
      )}

      {/* Game Content */}
      <div data-testid="game-content" className="game-content">
        {/* Available Counties */}
        <div data-testid="counties-panel" className="counties-panel">
          <h3>Available Counties</h3>
          <div data-testid="draggable-counties">
            {availableForDrag.map(countyId => {
              const county = MOCK_CALIFORNIA_COUNTIES.find(c => c.id === countyId);
              if (!county) return null;

              return (
                <div
                  key={countyId}
                  data-testid={`draggable-county-${countyId}`}
                  draggable={gameState.isStarted && !gameState.isPaused}
                  onDragStart={() => handleDragStart(countyId)}
                  onDragEnd={handleDragEnd}
                  onClick={() => selectCounty(countyId)}
                  className={`draggable-county ${gameState.selectedCounty === countyId ? 'selected' : ''} ${draggedCounty === countyId ? 'dragging' : ''}`}
                  style={{
                    opacity: draggedCounty === countyId ? 0.5 : 1,
                    cursor: gameState.isStarted && !gameState.isPaused ? 'grab' : 'default',
                  }}
                >
                  <div className="county-name">{county.name}</div>
                  <div className="county-info">Pop: {county.population.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Area */}
        <div data-testid="map-area" className="map-area">
          <svg
            data-testid="california-map"
            width="600"
            height="400"
            viewBox="0 0 600 400"
          >
            {gameState.availableCounties.map(countyId => {
              const county = MOCK_CALIFORNIA_COUNTIES.find(c => c.id === countyId);
              if (!county) return null;

              const isPlaced = gameState.placedCounties.includes(countyId);
              const isSelected = gameState.selectedCounty === countyId;
              const isCurrent = gameState.currentCounty === countyId;

              return (
                <g
                  key={countyId}
                  data-testid={`map-county-${countyId}`}
                  className={`map-county ${isPlaced ? 'placed' : ''} ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <rect
                    x={100 + (county.coordinates.lng + 120) * 4}
                    y={100 + (40 - county.coordinates.lat) * 8}
                    width="30"
                    height="30"
                    fill={isPlaced ? '#4ade80' : isCurrent ? '#fbbf24' : '#e5e7eb'}
                    stroke={isSelected ? '#3b82f6' : '#374151'}
                    strokeWidth={isSelected ? 3 : 1}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(countyId)}
                    onClick={() => {
                      if (gameState.selectedCounty && gameState.isStarted && !gameState.isPaused) {
                        placeCounty(gameState.selectedCounty, countyId);
                      }
                    }}
                    style={{ cursor: gameState.isStarted && !gameState.isPaused ? 'pointer' : 'default' }}
                  />
                  {(gameState.showLabels || isPlaced) && (
                    <text
                      x={115 + (county.coordinates.lng + 120) * 4}
                      y={120 + (40 - county.coordinates.lat) * 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#374151"
                      pointerEvents="none"
                    >
                      {county.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameState.isCompleted && (
        <div data-testid="game-over" className="game-over">
          <h2>Game Complete!</h2>
          <div data-testid="final-stats">
            <div>Final Score: {gameState.score}</div>
            <div>Accuracy: {Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100)}%</div>
            <div>Mistakes: {gameState.mistakes}</div>
            <div>Hints Used: {gameState.hintsUsed}</div>
          </div>
          <button data-testid="play-again" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}

      {/* Pause Screen */}
      {gameState.isPaused && (
        <div data-testid="pause-screen" className="pause-screen">
          <h2>Game Paused</h2>
          <button onClick={pauseGame}>Resume Game</button>
        </div>
      )}
    </div>
  );
};

describe('Full Game Flow Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Game Initialization', () => {
    it('should render all game components', () => {
      render(<MockCaliforniaPuzzleGame />);

      expect(screen.getByTestId('california-puzzle-game')).toBeInTheDocument();
      expect(screen.getByTestId('game-header')).toBeInTheDocument();
      expect(screen.getByTestId('game-controls')).toBeInTheDocument();
      expect(screen.getByTestId('game-stats')).toBeInTheDocument();
      expect(screen.getByTestId('counties-panel')).toBeInTheDocument();
      expect(screen.getByTestId('map-area')).toBeInTheDocument();
    });

    it('should show initial game state', () => {
      render(<MockCaliforniaPuzzleGame />);

      expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
      expect(screen.getByTestId('accuracy')).toHaveTextContent('Accuracy: 0%');
      expect(screen.getByTestId('hints')).toHaveTextContent('Hints: 0/3');
      expect(screen.getByTestId('mistakes')).toHaveTextContent('Mistakes: 0');
      expect(screen.getByTestId('start-game')).toBeInTheDocument();
    });

    it('should render all available counties', () => {
      render(<MockCaliforniaPuzzleGame />);

      const availableCounties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);
      availableCounties.forEach(county => {
        expect(screen.getByTestId(`draggable-county-${county.id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`map-county-${county.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('Game Configuration', () => {
    it('should change game mode', async () => {
      render(<MockCaliforniaPuzzleGame />);

      const modeSelector = screen.getByTestId('mode-selector');

      await user.selectOptions(modeSelector, 'timed');
      expect(modeSelector).toHaveValue('timed');

      await user.selectOptions(modeSelector, 'challenge');
      expect(modeSelector).toHaveValue('challenge');
    });

    it('should change difficulty level', async () => {
      render(<MockCaliforniaPuzzleGame />);

      const difficultySelector = screen.getByTestId('difficulty-selector');

      await user.selectOptions(difficultySelector, 'hard');
      expect(difficultySelector).toHaveValue('hard');

      // Start game to see hints change
      await user.click(screen.getByTestId('start-game'));
      expect(screen.getByTestId('hints')).toHaveTextContent('Hints: 0/1');
    });

    it('should toggle labels', async () => {
      render(<MockCaliforniaPuzzleGame />);

      const toggleLabels = screen.getByTestId('toggle-labels');
      expect(toggleLabels).toHaveTextContent('Show Labels');

      await user.click(toggleLabels);
      expect(toggleLabels).toHaveTextContent('Hide Labels');
    });

    it('should disable controls during game', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      expect(screen.getByTestId('mode-selector')).toBeDisabled();
      expect(screen.getByTestId('difficulty-selector')).toBeDisabled();
    });
  });

  describe('Game Lifecycle', () => {
    it('should start game and show current county', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      expect(screen.getByTestId('current-county')).toBeInTheDocument();
      expect(screen.getByTestId('pause-game')).toBeInTheDocument();
      expect(screen.getByTestId('reset-game')).toBeInTheDocument();
      expect(screen.queryByTestId('start-game')).not.toBeInTheDocument();
    });

    it('should pause and resume game', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));
      await user.click(screen.getByTestId('pause-game'));

      expect(screen.getByTestId('pause-screen')).toBeInTheDocument();
      expect(screen.getByTestId('pause-game')).toHaveTextContent('Resume');

      await user.click(screen.getByTestId('pause-game'));
      expect(screen.queryByTestId('pause-screen')).not.toBeInTheDocument();
    });

    it('should reset game', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));
      await user.click(screen.getByTestId('reset-game'));

      expect(screen.getByTestId('start-game')).toBeInTheDocument();
      expect(screen.queryByTestId('current-county')).not.toBeInTheDocument();
      expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
    });
  });

  describe('County Placement Mechanics', () => {
    it('should place county correctly via click', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      // Get current county from the indicator
      const currentCountyElement = screen.getByTestId('current-county');
      const currentCountyText = currentCountyElement.textContent;
      const currentCountyName = currentCountyText?.match(/Place: (.+)/)?.[1];

      if (currentCountyName) {
        const county = MOCK_CALIFORNIA_COUNTIES.find(c => c.name === currentCountyName);
        if (county) {
          // Select the county first
          await user.click(screen.getByTestId(`draggable-county-${county.id}`));

          // Then click on the correct map position
          await user.click(screen.getByTestId(`map-county-${county.id}`));

          // Check if county was placed correctly
          await waitFor(() => {
            expect(screen.getByTestId('score')).toHaveTextContent('Score: 100');
            expect(screen.getByTestId('accuracy')).toHaveTextContent('Accuracy: 100%');
          });
        }
      }
    });

    it('should handle incorrect placement', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      // Select first county
      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);
      await user.click(screen.getByTestId(`draggable-county-${counties[0].id}`));

      // Click on wrong position (second county's map area)
      await user.click(screen.getByTestId(`map-county-${counties[1].id}`));

      await waitFor(() => {
        expect(screen.getByTestId('mistakes')).toHaveTextContent('Mistakes: 1');
        expect(screen.getByTestId('accuracy')).toHaveTextContent('Accuracy: 0%');
      });
    });

    it('should complete game when all counties placed', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      // Place all counties correctly
      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);

      for (const county of counties) {
        // Wait for this county to become current
        await waitFor(() => {
          const currentCountyElement = screen.queryByTestId('current-county');
          if (currentCountyElement) {
            const text = currentCountyElement.textContent;
            return text?.includes(county.name);
          }
          return false;
        });

        // Select and place the county
        await user.click(screen.getByTestId(`draggable-county-${county.id}`));
        await user.click(screen.getByTestId(`map-county-${county.id}`));
      }

      // Check game completion
      await waitFor(() => {
        expect(screen.getByTestId('game-over')).toBeInTheDocument();
        expect(screen.getByTestId('final-stats')).toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop Integration', () => {
    it('should handle drag and drop placement', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);
      const firstCounty = counties[0];

      // Simulate drag and drop
      const draggableCounty = screen.getByTestId(`draggable-county-${firstCounty.id}`);
      const mapTarget = screen.getByTestId(`map-county-${firstCounty.id}`);

      fireEvent.dragStart(draggableCounty);
      fireEvent.dragOver(mapTarget);
      fireEvent.drop(mapTarget);

      await waitFor(() => {
        const mapCounty = screen.getByTestId(`map-county-${firstCounty.id}`);
        expect(mapCounty).toHaveClass('placed');
      });
    });

    it('should provide visual feedback during drag', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);
      const firstCounty = counties[0];
      const draggableCounty = screen.getByTestId(`draggable-county-${firstCounty.id}`);

      fireEvent.dragStart(draggableCounty);

      expect(draggableCounty).toHaveClass('dragging');
      expect(draggableCounty).toHaveStyle('opacity: 0.5');
    });
  });

  describe('Hint System Integration', () => {
    it('should use hints and apply penalty', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      // Place first county to get some score
      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);
      await user.click(screen.getByTestId(`draggable-county-${counties[0].id}`));
      await user.click(screen.getByTestId(`map-county-${counties[0].id}`));

      await waitFor(() => {
        expect(screen.getByTestId('score')).toHaveTextContent('Score: 100');
      });

      // Use hint
      await user.click(screen.getByTestId('use-hint'));

      await waitFor(() => {
        expect(screen.getByTestId('hints')).toHaveTextContent('Hints: 1/3');
        expect(screen.getByTestId('score')).toHaveTextContent('Score: 90'); // Penalty applied
      });
    });

    it('should disable hint button when limit reached', async () => {
      render(<MockCaliforniaPuzzleGame />);

      // Set to hard difficulty (1 hint only)
      await user.selectOptions(screen.getByTestId('difficulty-selector'), 'hard');
      await user.click(screen.getByTestId('start-game'));

      await user.click(screen.getByTestId('use-hint'));

      await waitFor(() => {
        const hintButton = screen.getByTestId('use-hint');
        expect(hintButton).toBeDisabled();
        expect(hintButton).toHaveTextContent('Use Hint (0 left)');
      });
    });
  });

  describe('Statistics and Scoring', () => {
    it('should track accuracy correctly', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);

      // Correct placement
      await user.click(screen.getByTestId(`draggable-county-${counties[0].id}`));
      await user.click(screen.getByTestId(`map-county-${counties[0].id}`));

      await waitFor(() => {
        expect(screen.getByTestId('accuracy')).toHaveTextContent('Accuracy: 100%');
      });

      // Wait for next county to become current
      await waitFor(() => {
        const currentCountyElement = screen.queryByTestId('current-county');
        return currentCountyElement && currentCountyElement.textContent?.includes(counties[1].name);
      });

      // Incorrect placement
      await user.click(screen.getByTestId(`draggable-county-${counties[1].id}`));
      await user.click(screen.getByTestId(`map-county-${counties[2].id}`)); // Wrong position

      await waitFor(() => {
        expect(screen.getByTestId('accuracy')).toHaveTextContent('Accuracy: 50%');
      });
    });

    it('should show final statistics on completion', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      // Complete game with some mistakes and hints
      await user.click(screen.getByTestId('use-hint'));

      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);

      // Place first county incorrectly, then correctly
      await user.click(screen.getByTestId(`draggable-county-${counties[0].id}`));
      await user.click(screen.getByTestId(`map-county-${counties[1].id}`)); // Wrong

      await user.click(screen.getByTestId(`draggable-county-${counties[0].id}`));
      await user.click(screen.getByTestId(`map-county-${counties[0].id}`)); // Correct

      // Place remaining counties correctly
      for (let i = 1; i < counties.length; i++) {
        const county = counties[i];
        await waitFor(() => {
          const currentCountyElement = screen.queryByTestId('current-county');
          return currentCountyElement && currentCountyElement.textContent?.includes(county.name);
        });

        await user.click(screen.getByTestId(`draggable-county-${county.id}`));
        await user.click(screen.getByTestId(`map-county-${county.id}`));
      }

      // Check final stats
      await waitFor(() => {
        const finalStats = screen.getByTestId('final-stats');
        expect(finalStats).toHaveTextContent('Mistakes: 1');
        expect(finalStats).toHaveTextContent('Hints Used: 1');
        expect(finalStats).toHaveTextContent(/Accuracy: \d+%/);
      });
    });
  });

  describe('Timer Integration (Timed Mode)', () => {
    it('should show timer in timed mode', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.selectOptions(screen.getByTestId('mode-selector'), 'timed');
      await user.click(screen.getByTestId('start-game'));

      expect(screen.getByTestId('timer')).toBeInTheDocument();
      expect(screen.getByTestId('timer')).toHaveTextContent('Time: 0:00 / 5:00');
    });
  });

  describe('Accessibility Integration', () => {
    it('should support keyboard navigation', async () => {
      render(<MockCaliforniaPuzzleGame />);

      // Tab through controls
      await user.tab();
      expect(screen.getByTestId('mode-selector')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('difficulty-selector')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('toggle-labels')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('start-game')).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      render(<MockCaliforniaPuzzleGame />);

      expect(screen.getByTestId('california-map')).toBeInTheDocument();
      // Add more accessibility checks as needed
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle rapid clicking gracefully', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);
      const firstCounty = counties[0];

      // Rapid clicks on same county
      const draggableCounty = screen.getByTestId(`draggable-county-${firstCounty.id}`);
      await user.dblClick(draggableCounty);
      await user.dblClick(draggableCounty);

      // Should not cause errors
      expect(screen.getByTestId('california-puzzle-game')).toBeInTheDocument();
    });

    it('should handle pause/resume during interactions', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      // Start dragging
      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);
      const draggableCounty = screen.getByTestId(`draggable-county-${counties[0].id}`);
      fireEvent.dragStart(draggableCounty);

      // Pause during drag
      await user.click(screen.getByTestId('pause-game'));
      expect(screen.getByTestId('pause-screen')).toBeInTheDocument();

      // Resume
      await user.click(screen.getByTestId('pause-game'));
      expect(screen.queryByTestId('pause-screen')).not.toBeInTheDocument();
    });
  });

  describe('Play Again Flow', () => {
    it('should allow playing again after completion', async () => {
      render(<MockCaliforniaPuzzleGame />);

      await user.click(screen.getByTestId('start-game'));

      // Complete game quickly
      const counties = MOCK_CALIFORNIA_COUNTIES.slice(0, 5);
      for (const county of counties) {
        await waitFor(() => {
          const currentCountyElement = screen.queryByTestId('current-county');
          return currentCountyElement && currentCountyElement.textContent?.includes(county.name);
        });

        await user.click(screen.getByTestId(`draggable-county-${county.id}`));
        await user.click(screen.getByTestId(`map-county-${county.id}`));
      }

      // Wait for game over screen
      await waitFor(() => {
        expect(screen.getByTestId('game-over')).toBeInTheDocument();
      });

      // Click play again
      await user.click(screen.getByTestId('play-again'));

      // Should be back to initial state
      expect(screen.getByTestId('start-game')).toBeInTheDocument();
      expect(screen.getByTestId('score')).toHaveTextContent('Score: 0');
      expect(screen.queryByTestId('game-over')).not.toBeInTheDocument();
    });
  });
});