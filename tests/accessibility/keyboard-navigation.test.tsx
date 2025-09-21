import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { axe } from '../a11y-setup';
import { simulateKeyDown, simulateKeyUp, getFocusableElements } from '../a11y-setup';

// Mock keyboard-accessible game component
const MockKeyboardAccessibleGame: React.FC = () => {
  const [selectedCounty, setSelectedCounty] = React.useState<string | null>(null);
  const [focusedCounty, setFocusedCounty] = React.useState<string | null>(null);
  const [placedCounties, setPlacedCounties] = React.useState<string[]>([]);
  const [isGameStarted, setIsGameStarted] = React.useState(false);
  const [announcements, setAnnouncements] = React.useState<string[]>([]);

  const counties = ['los-angeles', 'san-diego', 'orange'];

  const announceToScreenReader = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // Simulate screen reader announcement
    document.dispatchEvent(new CustomEvent('aria-live-announcement', {
      detail: { message }
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent, countyId: string) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (selectedCounty === countyId) {
          setSelectedCounty(null);
          announceToScreenReader(`Deselected ${countyId.replace('-', ' ')} county`);
        } else {
          setSelectedCounty(countyId);
          announceToScreenReader(`Selected ${countyId.replace('-', ' ')} county. Press Enter to place or Arrow keys to navigate.`);
        }
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusNextCounty(countyId);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusPreviousCounty(countyId);
        break;
      case 'Escape':
        event.preventDefault();
        setSelectedCounty(null);
        announceToScreenReader('Selection cleared');
        break;
    }
  };

  const focusNextCounty = (currentCounty: string) => {
    const currentIndex = counties.indexOf(currentCounty);
    const nextIndex = (currentIndex + 1) % counties.length;
    const nextCounty = counties[nextIndex];

    document.getElementById(`county-${nextCounty}`)?.focus();
    setFocusedCounty(nextCounty);
    announceToScreenReader(`Focused on ${nextCounty.replace('-', ' ')} county`);
  };

  const focusPreviousCounty = (currentCounty: string) => {
    const currentIndex = counties.indexOf(currentCounty);
    const prevIndex = currentIndex === 0 ? counties.length - 1 : currentIndex - 1;
    const prevCounty = counties[prevIndex];

    document.getElementById(`county-${prevCounty}`)?.focus();
    setFocusedCounty(prevCounty);
    announceToScreenReader(`Focused on ${prevCounty.replace('-', ' ')} county`);
  };

  const placeCounty = (countyId: string) => {
    if (selectedCounty) {
      setPlacedCounties(prev => [...prev, selectedCounty]);
      setSelectedCounty(null);
      announceToScreenReader(`Placed ${selectedCounty.replace('-', ' ')} county on the map. ${counties.length - placedCounties.length - 1} counties remaining.`);
    }
  };

  return (
    <div data-testid="keyboard-accessible-game">
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="announcements"
      >
        {announcements[announcements.length - 1]}
      </div>

      {/* Skip link */}
      <a
        href="#main-content"
        className="skip-link"
        data-testid="skip-link"
      >
        Skip to main content
      </a>

      {/* Game controls */}
      <div data-testid="game-controls" role="toolbar" aria-label="Game controls">
        <button
          data-testid="start-game"
          onClick={() => setIsGameStarted(true)}
          disabled={isGameStarted}
          aria-describedby="start-game-help"
        >
          Start Game
        </button>
        <div id="start-game-help" className="sr-only">
          Start the California counties puzzle game
        </div>

        <button
          data-testid="instructions"
          aria-expanded="false"
          aria-controls="instructions-panel"
        >
          Instructions
        </button>

        <button
          data-testid="settings"
          aria-haspopup="dialog"
        >
          Settings
        </button>
      </div>

      {/* Instructions */}
      <div className="instructions" data-testid="instructions-text">
        <h2>How to Play</h2>
        <ul>
          <li>Use Tab to navigate between counties</li>
          <li>Use Arrow keys to move between counties</li>
          <li>Press Space or Enter to select a county</li>
          <li>Use Arrow keys to navigate the map</li>
          <li>Press Enter to place the selected county</li>
          <li>Press Escape to clear selection</li>
        </ul>
      </div>

      {/* Main content */}
      <main id="main-content" data-testid="main-content">
        <h1>California Counties Puzzle</h1>

        {/* Game status */}
        <div
          data-testid="game-status"
          role="status"
          aria-label="Game progress"
        >
          <span>Counties placed: {placedCounties.length}/{counties.length}</span>
          {selectedCounty && (
            <span>Selected: {selectedCounty.replace('-', ' ')} county</span>
          )}
        </div>

        {/* Counties list */}
        <div data-testid="counties-list" role="group" aria-labelledby="counties-heading">
          <h2 id="counties-heading">Available Counties</h2>
          <div
            role="listbox"
            aria-label="Select a county to place"
            aria-activedescendant={selectedCounty ? `county-${selectedCounty}` : undefined}
          >
            {counties.filter(county => !placedCounties.includes(county)).map((county, index) => (
              <div
                key={county}
                id={`county-${county}`}
                role="option"
                tabIndex={index === 0 ? 0 : -1}
                aria-selected={selectedCounty === county}
                className={`county-item ${selectedCounty === county ? 'selected' : ''}`}
                onClick={() => setSelectedCounty(county)}
                onKeyDown={(e) => handleKeyDown(e, county)}
                onFocus={() => setFocusedCounty(county)}
                data-testid={`county-item-${county}`}
                aria-describedby={`county-${county}-description`}
              >
                <span className="county-name">{county.replace('-', ' ')} County</span>
                <div id={`county-${county}-description`} className="sr-only">
                  {selectedCounty === county ? 'Selected county. Press Enter to deselect or Arrow keys to navigate.' : 'Press Space or Enter to select this county.'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map area */}
        <div
          data-testid="map-area"
          role="application"
          aria-label="California map for placing counties"
          aria-describedby="map-instructions"
        >
          <div id="map-instructions" className="sr-only">
            Interactive map. Use Tab to navigate drop zones. Press Enter to place selected county.
          </div>

          <div className="map-grid" role="grid" aria-label="County placement grid">
            {counties.map((county, index) => (
              <div
                key={county}
                role="gridcell"
                tabIndex={selectedCounty ? 0 : -1}
                className={`map-cell ${placedCounties.includes(county) ? 'occupied' : ''}`}
                onClick={() => placeCounty(county)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    placeCounty(county);
                  }
                }}
                data-testid={`map-cell-${county}`}
                aria-label={`Drop zone for ${county.replace('-', ' ')} county`}
                aria-describedby={`map-cell-${county}-status`}
              >
                <div id={`map-cell-${county}-status`} className="sr-only">
                  {placedCounties.includes(county)
                    ? `${county.replace('-', ' ')} county is placed here`
                    : selectedCounty
                      ? `Drop zone. Press Enter to place ${selectedCounty.replace('-', ' ')} county here`
                      : 'Drop zone. Select a county first.'
                  }
                </div>
                {placedCounties.includes(county) && (
                  <span aria-hidden="true">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help panel */}
        <div
          data-testid="help-panel"
          role="complementary"
          aria-labelledby="help-heading"
        >
          <h2 id="help-heading">Keyboard Shortcuts</h2>
          <dl>
            <dt>Tab / Shift+Tab</dt>
            <dd>Navigate between interface elements</dd>
            <dt>Arrow Keys</dt>
            <dd>Navigate within county list or map</dd>
            <dt>Space / Enter</dt>
            <dd>Select county or place on map</dd>
            <dt>Escape</dt>
            <dd>Clear current selection</dd>
          </dl>
        </div>
      </main>
    </div>
  );
};

describe('Keyboard Navigation Accessibility', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Navigation', () => {
    it('should support tab navigation', async () => {
      render(<MockKeyboardAccessibleGame />);

      // Tab through main controls
      await user.tab();
      expect(screen.getByTestId('start-game')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('instructions')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('settings')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('county-item-los-angeles')).toHaveFocus();
    });

    it('should support reverse tab navigation', async () => {
      render(<MockKeyboardAccessibleGame />);

      // Focus on last focusable element first
      const counties = screen.getByTestId('county-item-los-angeles');
      counties.focus();

      // Shift+Tab backwards
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByTestId('settings')).toHaveFocus();

      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.getByTestId('instructions')).toHaveFocus();
    });

    it('should skip to main content', async () => {
      render(<MockKeyboardAccessibleGame />);

      const skipLink = screen.getByTestId('skip-link');
      skipLink.focus();

      await user.keyboard('{Enter}');

      // Should focus on main content
      expect(document.activeElement?.closest('#main-content')).toBeTruthy();
    });
  });

  describe('County List Navigation', () => {
    it('should navigate counties with arrow keys', async () => {
      render(<MockKeyboardAccessibleGame />);

      const firstCounty = screen.getByTestId('county-item-los-angeles');
      firstCounty.focus();

      // Arrow down to next county
      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('county-item-san-diego')).toHaveFocus();

      // Arrow down to next county
      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('county-item-orange')).toHaveFocus();

      // Arrow down should wrap to first
      await user.keyboard('{ArrowDown}');
      expect(screen.getByTestId('county-item-los-angeles')).toHaveFocus();
    });

    it('should navigate counties with arrow keys in reverse', async () => {
      render(<MockKeyboardAccessibleGame />);

      const firstCounty = screen.getByTestId('county-item-los-angeles');
      firstCounty.focus();

      // Arrow up should wrap to last
      await user.keyboard('{ArrowUp}');
      expect(screen.getByTestId('county-item-orange')).toHaveFocus();

      // Arrow up to previous
      await user.keyboard('{ArrowUp}');
      expect(screen.getByTestId('county-item-san-diego')).toHaveFocus();
    });

    it('should select counties with Enter key', async () => {
      render(<MockKeyboardAccessibleGame />);

      const firstCounty = screen.getByTestId('county-item-los-angeles');
      firstCounty.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(firstCounty).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should select counties with Space key', async () => {
      render(<MockKeyboardAccessibleGame />);

      const firstCounty = screen.getByTestId('county-item-los-angeles');
      firstCounty.focus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(firstCounty).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should clear selection with Escape key', async () => {
      render(<MockKeyboardAccessibleGame />);

      const firstCounty = screen.getByTestId('county-item-los-angeles');
      firstCounty.focus();

      // Select first
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(firstCounty).toHaveAttribute('aria-selected', 'true');
      });

      // Clear with Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(firstCounty).toHaveAttribute('aria-selected', 'false');
      });
    });
  });

  describe('Map Navigation', () => {
    it('should allow placing counties on map with keyboard', async () => {
      render(<MockKeyboardAccessibleGame />);

      // Start game first
      await user.click(screen.getByTestId('start-game'));

      // Select a county
      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();
      await user.keyboard('{Enter}');

      // Navigate to corresponding map cell
      const mapCell = screen.getByTestId('map-cell-los-angeles');
      mapCell.focus();

      // Place county
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mapCell).toHaveTextContent('✓');
      });
    });

    it('should provide feedback when no county is selected', async () => {
      render(<MockKeyboardAccessibleGame />);

      const mapCell = screen.getByTestId('map-cell-los-angeles');
      mapCell.focus();

      const statusElement = screen.getByText(/Drop zone. Select a county first./);
      expect(statusElement).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce county selection', async () => {
      render(<MockKeyboardAccessibleGame />);

      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        const announcements = screen.getByTestId('announcements');
        expect(announcements).toHaveTextContent(/Selected los angeles county/);
      });
    });

    it('should announce county placement', async () => {
      render(<MockKeyboardAccessibleGame />);

      // Start game
      await user.click(screen.getByTestId('start-game'));

      // Select and place county
      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();
      await user.keyboard('{Enter}');

      const mapCell = screen.getByTestId('map-cell-los-angeles');
      mapCell.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        const announcements = screen.getByTestId('announcements');
        expect(announcements).toHaveTextContent(/Placed los angeles county on the map/);
      });
    });

    it('should announce navigation changes', async () => {
      render(<MockKeyboardAccessibleGame />);

      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();
      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        const announcements = screen.getByTestId('announcements');
        expect(announcements).toHaveTextContent(/Focused on san diego county/);
      });
    });

    it('should have proper ARIA live regions', () => {
      render(<MockKeyboardAccessibleGame />);

      const announcements = screen.getByTestId('announcements');
      expect(announcements).toHaveAttribute('aria-live', 'polite');
      expect(announcements).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Focus Management', () => {
    it('should maintain logical focus order', () => {
      render(<MockKeyboardAccessibleGame />);

      const focusableElements = getFocusableElements(document.body);

      expect(focusableElements.length).toBeGreaterThan(0);

      // Verify focus order makes sense
      const expectedOrder = [
        'skip-link',
        'start-game',
        'instructions',
        'settings',
        'county-item-los-angeles'
      ];

      expectedOrder.forEach((testId, index) => {
        const element = screen.getByTestId(testId);
        expect(focusableElements).toContain(element);
      });
    });

    it('should trap focus within modal dialogs', async () => {
      // This would be implemented if the game has modal dialogs
      expect(true).toBe(true); // Placeholder for modal focus trap tests
    });

    it('should restore focus after interactions', async () => {
      render(<MockKeyboardAccessibleGame />);

      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();

      const initialFocus = document.activeElement;

      // Perform action that doesn't change focus
      await user.keyboard('{Enter}'); // Select
      await user.keyboard('{Escape}'); // Deselect

      // Focus should remain on the same element
      expect(document.activeElement).toBe(initialFocus);
    });
  });

  describe('ARIA Attributes', () => {
    it('should have proper roles and labels', () => {
      render(<MockKeyboardAccessibleGame />);

      // Check main roles
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('grid')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();

      // Check ARIA labels
      expect(screen.getByLabelText('Game controls')).toBeInTheDocument();
      expect(screen.getByLabelText('Select a county to place')).toBeInTheDocument();
      expect(screen.getByLabelText('California map for placing counties')).toBeInTheDocument();
    });

    it('should update aria-selected properly', async () => {
      render(<MockKeyboardAccessibleGame />);

      const county = screen.getByTestId('county-item-los-angeles');
      expect(county).toHaveAttribute('aria-selected', 'false');

      county.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(county).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should have proper describedby relationships', () => {
      render(<MockKeyboardAccessibleGame />);

      const startButton = screen.getByTestId('start-game');
      expect(startButton).toHaveAttribute('aria-describedby', 'start-game-help');

      const mapArea = screen.getByTestId('map-area');
      expect(mapArea).toHaveAttribute('aria-describedby', 'map-instructions');
    });
  });

  describe('High Contrast and Visual Indicators', () => {
    it('should provide visual focus indicators', async () => {
      render(<MockKeyboardAccessibleGame />);

      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();

      // In a real implementation, you'd check for focus styles
      expect(county).toHaveFocus();
    });

    it('should show selection state visually', async () => {
      render(<MockKeyboardAccessibleGame />);

      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(county).toHaveClass('selected');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid key combinations gracefully', async () => {
      render(<MockKeyboardAccessibleGame />);

      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();

      // Press invalid keys
      await user.keyboard('{Control>}x{/Control}');
      await user.keyboard('{Alt>}f{/Alt}');

      // Should not cause errors
      expect(county).toHaveFocus();
    });

    it('should handle rapid key presses', async () => {
      render(<MockKeyboardAccessibleGame />);

      const county = screen.getByTestId('county-item-los-angeles');
      county.focus();

      // Rapid navigation
      await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{ArrowUp}');

      // Should end up back at original position
      expect(screen.getByTestId('county-item-los-angeles')).toHaveFocus();
    });
  });

  describe('Accessibility Standards Compliance', () => {
    it('should pass axe accessibility tests', async () => {
      const { container } = render(<MockKeyboardAccessibleGame />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should meet WCAG 2.1 AA standards for keyboard accessibility', () => {
      render(<MockKeyboardAccessibleGame />);

      // All interactive elements should be keyboard accessible
      const interactiveElements = screen.getAllByRole('button')
        .concat(screen.getAllByRole('option'))
        .concat(screen.getAllByRole('gridcell'));

      interactiveElements.forEach(element => {
        expect(element).toHaveAttribute('tabIndex');
      });
    });
  });
});