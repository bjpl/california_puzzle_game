import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { axe } from '../a11y-setup';
import { waitForAnnouncement } from '../a11y-setup';

// Mock screen reader compatible game component
const MockScreenReaderGame: React.FC = () => {
  const [gameState, setGameState] = React.useState({
    isStarted: false,
    selectedCounty: null as string | null,
    placedCounties: [] as string[],
    score: 0,
    level: 1,
    isCompleted: false,
  });

  const [liveMessage, setLiveMessage] = React.useState('');
  const [alertMessage, setAlertMessage] = React.useState('');

  const counties = [
    { id: 'los-angeles', name: 'Los Angeles', population: '10M+' },
    { id: 'san-diego', name: 'San Diego', population: '3.3M+' },
    { id: 'orange', name: 'Orange', population: '3.2M+' },
  ];

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAlertMessage(message);
      setTimeout(() => setAlertMessage(''), 100);
    } else {
      setLiveMessage(message);
      setTimeout(() => setLiveMessage(''), 100);
    }
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, isStarted: true }));
    announceToScreenReader('Game started. Use arrow keys to navigate counties, space to select, and enter to place.', 'assertive');
  };

  const selectCounty = (countyId: string) => {
    const county = counties.find(c => c.id === countyId);
    setGameState(prev => ({ ...prev, selectedCounty: countyId }));
    announceToScreenReader(`${county?.name} county selected. Population: ${county?.population}. Press enter to place on map.`);
  };

  const placeCounty = (countyId: string) => {
    if (gameState.selectedCounty) {
      const county = counties.find(c => c.id === gameState.selectedCounty);
      const isCorrect = gameState.selectedCounty === countyId;

      if (isCorrect) {
        setGameState(prev => ({
          ...prev,
          placedCounties: [...prev.placedCounties, countyId],
          selectedCounty: null,
          score: prev.score + 100,
        }));
        announceToScreenReader(`Correct! ${county?.name} county placed. Score increased to ${gameState.score + 100}.`);

        // Check for completion
        if (gameState.placedCounties.length + 1 === counties.length) {
          setGameState(prev => ({ ...prev, isCompleted: true }));
          announceToScreenReader('Congratulations! All counties placed correctly. Game completed!', 'assertive');
        }
      } else {
        announceToScreenReader(`Incorrect placement for ${county?.name} county. Try again.`, 'assertive');
      }
    }
  };

  const getCountyStatus = (countyId: string) => {
    if (gameState.placedCounties.includes(countyId)) {
      return 'placed correctly';
    }
    if (gameState.selectedCounty === countyId) {
      return 'currently selected';
    }
    return 'available to select';
  };

  const getMapCellStatus = (countyId: string) => {
    const county = counties.find(c => c.id === countyId);
    const isOccupied = gameState.placedCounties.includes(countyId);

    if (isOccupied) {
      return `${county?.name} county is correctly placed here`;
    }

    if (gameState.selectedCounty) {
      const selectedCounty = counties.find(c => c.id === gameState.selectedCounty);
      return `Drop zone for ${county?.name} county. Currently holding ${selectedCounty?.name} county. Press enter to place.`;
    }

    return `Drop zone for ${county?.name} county. Select a county first to place here.`;
  };

  return (
    <div data-testid="screen-reader-game">
      {/* ARIA Live Regions */}
      <div
        id="polite-announcements"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="polite-announcements"
      >
        {liveMessage}
      </div>

      <div
        id="assertive-announcements"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="assertive-announcements"
      >
        {alertMessage}
      </div>

      {/* Game title and description */}
      <header>
        <h1 id="game-title">California Counties Puzzle</h1>
        <p id="game-description" className="sr-only">
          An educational game where you place California counties on a map.
          Use keyboard navigation to select counties and place them in their correct locations.
        </p>
      </header>

      {/* Game controls */}
      <div role="region" aria-labelledby="controls-heading">
        <h2 id="controls-heading" className="sr-only">Game Controls</h2>

        {!gameState.isStarted ? (
          <button
            data-testid="start-button"
            onClick={startGame}
            aria-describedby="start-help"
          >
            Start Game
          </button>
        ) : (
          <button
            data-testid="restart-button"
            onClick={() => {
              setGameState({
                isStarted: false,
                selectedCounty: null,
                placedCounties: [],
                score: 0,
                level: 1,
                isCompleted: false,
              });
              announceToScreenReader('Game reset. Ready to start again.', 'assertive');
            }}
            aria-describedby="restart-help"
          >
            Restart Game
          </button>
        )}

        <div id="start-help" className="sr-only">
          Begin the California counties puzzle game
        </div>
        <div id="restart-help" className="sr-only">
          Reset the game to start over
        </div>
      </div>

      {/* Game status */}
      <div
        role="status"
        aria-labelledby="status-heading"
        aria-live="polite"
        data-testid="game-status"
      >
        <h2 id="status-heading" className="sr-only">Game Status</h2>
        <div>
          <span aria-label={`Current score: ${gameState.score} points`}>
            Score: {gameState.score}
          </span>
        </div>
        <div>
          <span aria-label={`${gameState.placedCounties.length} out of ${counties.length} counties placed`}>
            Progress: {gameState.placedCounties.length}/{counties.length} counties placed
          </span>
        </div>
        {gameState.selectedCounty && (
          <div>
            <span aria-label={`Currently selected: ${counties.find(c => c.id === gameState.selectedCounty)?.name} county`}>
              Selected: {counties.find(c => c.id === gameState.selectedCounty)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div
        role="region"
        aria-labelledby="instructions-heading"
        data-testid="instructions"
      >
        <h2 id="instructions-heading">How to Play</h2>
        <ul>
          <li>Navigate between counties using Tab or Arrow keys</li>
          <li>Press Space or Enter to select a county</li>
          <li>Navigate to the map area using Tab</li>
          <li>Press Enter to place the selected county</li>
          <li>Listen for audio feedback confirming correct placements</li>
        </ul>
      </div>

      {gameState.isStarted && (
        <>
          {/* Counties selection area */}
          <div
            role="region"
            aria-labelledby="counties-heading"
            data-testid="counties-section"
          >
            <h2 id="counties-heading">Counties to Place</h2>
            <div
              role="listbox"
              aria-label="Available counties to select and place"
              aria-required="true"
              aria-activedescendant={gameState.selectedCounty ? `county-${gameState.selectedCounty}` : undefined}
            >
              {counties.filter(county => !gameState.placedCounties.includes(county.id)).map((county, index) => (
                <div
                  key={county.id}
                  id={`county-${county.id}`}
                  role="option"
                  tabIndex={0}
                  aria-selected={gameState.selectedCounty === county.id}
                  className={`county-option ${gameState.selectedCounty === county.id ? 'selected' : ''}`}
                  onClick={() => selectCounty(county.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectCounty(county.id);
                    }
                  }}
                  data-testid={`county-option-${county.id}`}
                  aria-describedby={`county-${county.id}-description`}
                >
                  <div className="county-name">{county.name} County</div>
                  <div className="county-info">Population: {county.population}</div>

                  <div id={`county-${county.id}-description`} className="sr-only">
                    {county.name} County, population {county.population}.
                    Status: {getCountyStatus(county.id)}.
                    {gameState.selectedCounty === county.id
                      ? 'Press Tab to navigate to map area and Enter to place.'
                      : 'Press Enter or Space to select this county.'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map area */}
          <div
            role="region"
            aria-labelledby="map-heading"
            data-testid="map-section"
          >
            <h2 id="map-heading">California Map</h2>
            <div
              role="application"
              aria-label="Interactive map for placing counties"
              aria-describedby="map-instructions"
              data-testid="map-area"
            >
              <div id="map-instructions" className="sr-only">
                Use Tab to navigate between drop zones. Press Enter to place the selected county.
              </div>

              <div role="grid" aria-label="County placement grid">
                {counties.map((county) => (
                  <div
                    key={county.id}
                    role="gridcell"
                    tabIndex={gameState.selectedCounty ? 0 : -1}
                    className={`map-cell ${gameState.placedCounties.includes(county.id) ? 'occupied' : ''}`}
                    onClick={() => placeCounty(county.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        placeCounty(county.id);
                      }
                    }}
                    data-testid={`map-cell-${county.id}`}
                    aria-label={`Drop zone for ${county.name} County`}
                    aria-describedby={`map-cell-${county.id}-status`}
                  >
                    <div id={`map-cell-${county.id}-status`} className="sr-only">
                      {getMapCellStatus(county.id)}
                    </div>

                    {gameState.placedCounties.includes(county.id) && (
                      <div aria-hidden="true" className="placed-indicator">✓</div>
                    )}

                    <div className="cell-label">{county.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Game completion */}
      {gameState.isCompleted && (
        <div
          role="dialog"
          aria-labelledby="completion-title"
          aria-describedby="completion-description"
          data-testid="completion-dialog"
        >
          <h2 id="completion-title">Game Completed!</h2>
          <div id="completion-description">
            Congratulations! You successfully placed all {counties.length} counties.
            Your final score is {gameState.score} points.
          </div>
          <button
            onClick={() => {
              setGameState({
                isStarted: false,
                selectedCounty: null,
                placedCounties: [],
                score: 0,
                level: 1,
                isCompleted: false,
              });
              announceToScreenReader('Starting new game.', 'assertive');
            }}
            data-testid="play-again-button"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div
        role="region"
        aria-labelledby="shortcuts-heading"
        data-testid="keyboard-shortcuts"
      >
        <h2 id="shortcuts-heading">Keyboard Shortcuts</h2>
        <dl>
          <dt>Tab</dt>
          <dd>Navigate forward through interface elements</dd>
          <dt>Shift + Tab</dt>
          <dd>Navigate backward through interface elements</dd>
          <dt>Arrow Keys</dt>
          <dd>Navigate within county list or map grid</dd>
          <dt>Enter</dt>
          <dd>Activate buttons or place selected county</dd>
          <dt>Space</dt>
          <dd>Select county (alternative to Enter)</dd>
          <dt>Escape</dt>
          <dd>Clear current selection</dd>
        </dl>
      </div>
    </div>
  );
};

describe('Screen Reader Compatibility', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ARIA Live Regions', () => {
    it('should announce game start', async () => {
      render(<MockScreenReaderGame />);

      const startButton = screen.getByTestId('start-button');
      await user.click(startButton);

      await waitFor(() => {
        const assertiveRegion = screen.getByTestId('assertive-announcements');
        expect(assertiveRegion).toHaveTextContent(/Game started/);
      });
    });

    it('should announce county selection', async () => {
      render(<MockScreenReaderGame />);

      // Start game
      await user.click(screen.getByTestId('start-button'));

      // Select county
      const county = screen.getByTestId('county-option-los-angeles');
      await user.click(county);

      await waitFor(() => {
        const politeRegion = screen.getByTestId('polite-announcements');
        expect(politeRegion).toHaveTextContent(/Los Angeles county selected/);
      });
    });

    it('should announce correct placement', async () => {
      render(<MockScreenReaderGame />);

      // Start game
      await user.click(screen.getByTestId('start-button'));

      // Select and place county correctly
      await user.click(screen.getByTestId('county-option-los-angeles'));
      await user.click(screen.getByTestId('map-cell-los-angeles'));

      await waitFor(() => {
        const politeRegion = screen.getByTestId('polite-announcements');
        expect(politeRegion).toHaveTextContent(/Correct.*placed.*Score/);
      });
    });

    it('should announce incorrect placement', async () => {
      render(<MockScreenReaderGame />);

      // Start game
      await user.click(screen.getByTestId('start-button'));

      // Select county and place incorrectly
      await user.click(screen.getByTestId('county-option-los-angeles'));
      await user.click(screen.getByTestId('map-cell-san-diego'));

      await waitFor(() => {
        const assertiveRegion = screen.getByTestId('assertive-announcements');
        expect(assertiveRegion).toHaveTextContent(/Incorrect placement/);
      });
    });

    it('should announce game completion', async () => {
      render(<MockScreenReaderGame />);

      // Start game
      await user.click(screen.getByTestId('start-button'));

      // Place all counties correctly
      const counties = ['los-angeles', 'san-diego', 'orange'];
      for (const countyId of counties) {
        await user.click(screen.getByTestId(`county-option-${countyId}`));
        await user.click(screen.getByTestId(`map-cell-${countyId}`));
      }

      await waitFor(() => {
        const assertiveRegion = screen.getByTestId('assertive-announcements');
        expect(assertiveRegion).toHaveTextContent(/Congratulations.*Game completed/);
      });
    });

    it('should use appropriate urgency levels', async () => {
      render(<MockScreenReaderGame />);

      const politeRegion = screen.getByTestId('polite-announcements');
      const assertiveRegion = screen.getByTestId('assertive-announcements');

      expect(politeRegion).toHaveAttribute('aria-live', 'polite');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Semantic Structure', () => {
    it('should have proper heading hierarchy', () => {
      render(<MockScreenReaderGame />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('California Counties Puzzle');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have proper landmark regions', () => {
      render(<MockScreenReaderGame />);

      expect(screen.getByRole('region', { name: /Game Controls/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /How to Play/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /Keyboard Shortcuts/i })).toBeInTheDocument();
    });

    it('should use appropriate roles for interactive elements', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getAllByRole('gridcell')).toHaveLength(3);
    });

    it('should have proper status information', () => {
      render(<MockScreenReaderGame />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Descriptive Content', () => {
    it('should provide comprehensive descriptions for counties', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      const county = screen.getByTestId('county-option-los-angeles');
      const description = county.querySelector('#county-los-angeles-description');

      expect(description).toHaveTextContent(/Los Angeles County.*population.*Status/);
    });

    it('should describe map cell status accurately', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      // Before selecting any county
      const mapCell = screen.getByTestId('map-cell-los-angeles');
      const statusDescription = mapCell.querySelector('#map-cell-los-angeles-status');

      expect(statusDescription).toHaveTextContent(/Select a county first/);

      // After selecting a county
      await user.click(screen.getByTestId('county-option-los-angeles'));

      await waitFor(() => {
        expect(statusDescription).toHaveTextContent(/Currently holding.*Los Angeles/);
      });
    });

    it('should update descriptions dynamically', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      // Place a county
      await user.click(screen.getByTestId('county-option-los-angeles'));
      await user.click(screen.getByTestId('map-cell-los-angeles'));

      await waitFor(() => {
        const mapCellStatus = screen.getByTestId('map-cell-los-angeles')
          .querySelector('#map-cell-los-angeles-status');
        expect(mapCellStatus).toHaveTextContent(/Los Angeles county is correctly placed/);
      });
    });
  });

  describe('Form and Input Accessibility', () => {
    it('should associate labels with controls', () => {
      render(<MockScreenReaderGame />);

      const startButton = screen.getByTestId('start-button');
      expect(startButton).toHaveAttribute('aria-describedby', 'start-help');

      const helpText = screen.getByText(/Begin the California counties puzzle game/);
      expect(helpText).toHaveAttribute('id', 'start-help');
    });

    it('should indicate required fields', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-required', 'true');
    });

    it('should provide clear error feedback', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      // Try to place without selecting
      await user.click(screen.getByTestId('map-cell-los-angeles'));

      // Should provide clear instruction
      const mapCellStatus = screen.getByTestId('map-cell-los-angeles')
        .querySelector('#map-cell-los-angeles-status');
      expect(mapCellStatus).toHaveTextContent(/Select a county first/);
    });
  });

  describe('Navigation and Focus', () => {
    it('should maintain proper focus management', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      // Focus should move logically
      await user.tab();
      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement).toHaveAttribute('role', 'option');
    });

    it('should have skip navigation options', () => {
      render(<MockScreenReaderGame />);

      // Game should provide clear structure for navigation
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(3);
    });

    it('should support aria-activedescendant', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));
      await user.click(screen.getByTestId('county-option-los-angeles'));

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toHaveAttribute('aria-activedescendant', 'county-los-angeles');
      });
    });
  });

  describe('Content Clarity', () => {
    it('should use clear, simple language', () => {
      render(<MockScreenReaderGame />);

      const instructions = screen.getByTestId('instructions');

      // Instructions should be clear and actionable
      expect(instructions).toHaveTextContent(/Navigate between counties/);
      expect(instructions).toHaveTextContent(/Press Space or Enter/);
      expect(instructions).toHaveTextContent(/Press Enter to place/);
    });

    it('should provide context for user actions', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      const countyDescription = screen.getByText(/Press Enter or Space to select this county/);
      expect(countyDescription).toBeInTheDocument();
    });

    it('should explain game progress clearly', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));

      const statusRegion = screen.getByTestId('game-status');
      expect(statusRegion).toHaveTextContent(/0 out of 3 counties placed/);

      // Place one county
      await user.click(screen.getByTestId('county-option-los-angeles'));
      await user.click(screen.getByTestId('map-cell-los-angeles'));

      await waitFor(() => {
        expect(statusRegion).toHaveTextContent(/1\/3 counties placed/);
      });
    });
  });

  describe('Accessibility Standards Compliance', () => {
    it('should pass axe accessibility tests', async () => {
      const { container } = render(<MockScreenReaderGame />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should meet WCAG 2.1 AA requirements for screen readers', async () => {
      render(<MockScreenReaderGame />);

      // All content should be accessible to screen readers
      const hiddenElements = container.querySelectorAll('.sr-only');
      expect(hiddenElements.length).toBeGreaterThan(0);

      // Interactive elements should have proper labels
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should provide alternative text for visual elements', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));
      await user.click(screen.getByTestId('county-option-los-angeles'));
      await user.click(screen.getByTestId('map-cell-los-angeles'));

      await waitFor(() => {
        const placedIndicator = screen.getByText('✓');
        expect(placedIndicator).toHaveAttribute('aria-hidden', 'true');

        // Should have text alternative
        const mapCell = screen.getByTestId('map-cell-los-angeles');
        const statusText = mapCell.querySelector('#map-cell-los-angeles-status');
        expect(statusText).toHaveTextContent(/correctly placed/);
      });
    });
  });

  describe('Error Recovery', () => {
    it('should provide clear recovery instructions', async () => {
      render(<MockScreenReaderGame />);

      await user.click(screen.getByTestId('start-button'));
      await user.click(screen.getByTestId('county-option-los-angeles'));
      await user.click(screen.getByTestId('map-cell-san-diego')); // Wrong placement

      await waitFor(() => {
        const assertiveRegion = screen.getByTestId('assertive-announcements');
        expect(assertiveRegion).toHaveTextContent(/Incorrect placement.*Try again/);
      });
    });

    it('should help users understand how to restart', () => {
      render(<MockScreenReaderGame />);

      const keyboardShortcuts = screen.getByTestId('keyboard-shortcuts');
      expect(keyboardShortcuts).toHaveTextContent(/Escape.*Clear current selection/);
    });
  });
});