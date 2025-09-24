// Game State Management for Study Mode <-> Puzzle transitions

export interface SavedGameState {
  placedCounties: string[];
  score: number;
  mistakes: number;
  timerState: {
    time: number;
    isRunning: boolean;
    isPaused: boolean;
    startTime: number | null;
    pausedTime: number;
    splits: Array<{ name: string; time: number; timestamp: number }>;
  };
  gameSettings: {
    difficulty: string;
    maxTime?: number;
    enableTimer: boolean;
    enableScoring: boolean;
    showMultipliers: boolean;
    playerName: string;
  };
  placementHistory: any[];
  currentCountyId?: string;
  timestamp: number;
}

const GAME_STATE_KEY = 'ca-puzzle-game-state';
const GAME_STATE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function saveGameState(gameState: Omit<SavedGameState, 'timestamp'>): boolean {
  try {
    const stateWithTimestamp: SavedGameState = {
      ...gameState,
      timestamp: Date.now()
    };

    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateWithTimestamp));
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    return false;
  }
}

export function loadGameState(): SavedGameState | null {
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (!savedState) return null;

    const gameState: SavedGameState = JSON.parse(savedState);

    // Check if state has expired
    if (Date.now() - gameState.timestamp > GAME_STATE_EXPIRY) {
      clearGameState();
      return null;
    }

    // Validate game state has actual progress and isn't completed
    if (gameState.placedCounties.length === 0 || gameState.placedCounties.length >= 58) {
      return null;
    }

    return gameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

export function hasValidGameState(): boolean {
  const gameState = loadGameState();
  return gameState !== null &&
         gameState.placedCounties.length > 0 &&
         gameState.placedCounties.length < 58; // Not completed
}

// Generate return URL with game state indication
export function generateStudyModeUrl(countyId: string, hasGameInProgress: boolean = false): string {
  const baseUrl = `/study?county=${countyId}`;
  return hasGameInProgress ? `${baseUrl}&returnTo=puzzle` : baseUrl;
}

// Generate return to game URL
export function generateReturnToGameUrl(): string {
  return '/puzzle?resume=true';
}

// Check if we should show "Return to Game" UI
export function shouldShowReturnToGame(): boolean {
  // Check URL params and game state
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');

  // Only show if:
  // 1. User came from puzzle game (has returnTo=puzzle parameter)
  // 2. There's a valid saved game with actual progress
  // 3. Game is not completed (still has counties to place)
  return returnTo === 'puzzle' && hasValidGameState();
}