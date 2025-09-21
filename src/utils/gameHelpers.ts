import { County, CountyPiece, Position, DifficultyLevel, CaliforniaRegion } from '@/types';

/**
 * Calculate the distance between two positions
 */
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
};

/**
 * Calculate placement accuracy based on distance from target
 */
export const calculateAccuracy = (
  targetPosition: Position,
  actualPosition: Position,
  tolerance: number = 50
): number => {
  const distance = calculateDistance(targetPosition, actualPosition);
  if (distance <= tolerance) {
    return Math.max(0, 1 - (distance / tolerance));
  }
  return 0;
};

/**
 * Get difficulty tolerance in pixels
 */
export const getDifficultyTolerance = (difficulty: DifficultyLevel): number => {
  const tolerances = {
    [DifficultyLevel.EASY]: 80,
    [DifficultyLevel.MEDIUM]: 60,
    [DifficultyLevel.HARD]: 40,
    [DifficultyLevel.EXPERT]: 25
  };
  return tolerances[difficulty];
};

/**
 * Calculate base score for a county placement
 */
export const calculateBaseScore = (
  county: County,
  accuracy: number,
  timeToPlace: number,
  difficulty: DifficultyLevel
): number => {
  const basePoints = 100;
  const difficultyMultiplier = {
    [DifficultyLevel.EASY]: 1.0,
    [DifficultyLevel.MEDIUM]: 1.5,
    [DifficultyLevel.HARD]: 2.0,
    [DifficultyLevel.EXPERT]: 3.0
  }[difficulty];

  const speedBonus = timeToPlace < 5000 ? 1.5 : timeToPlace < 10000 ? 1.2 : 1.0;
  const sizeBonus = county.area && county.area < 1000 ? 1.3 : 1.0; // Bonus for smaller counties

  return Math.round(basePoints * accuracy * difficultyMultiplier * speedBonus * sizeBonus);
};

/**
 * Get streak multiplier
 */
export const getStreakMultiplier = (streak: number): number => {
  return 1 + (Math.min(streak, 10) * 0.1); // Max 2x multiplier at 10 streak
};

/**
 * Format time duration for display
 */
export const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10); // Show 2 decimal places

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${seconds}.${ms.toString().padStart(2, '0')}s`;
  }
};

/**
 * Format score with commas
 */
export const formatScore = (score: number): string => {
  return score.toLocaleString();
};

/**
 * Get accuracy color based on percentage
 */
export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 0.95) return '#10b981'; // Emerald - Perfect
  if (accuracy >= 0.8) return '#f59e0b';  // Amber - Good
  if (accuracy >= 0.6) return '#f97316';  // Orange - OK
  return '#ef4444'; // Red - Poor
};

/**
 * Get difficulty color
 */
export const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  const colors = {
    [DifficultyLevel.EASY]: '#10b981',
    [DifficultyLevel.MEDIUM]: '#f59e0b',
    [DifficultyLevel.HARD]: '#f97316',
    [DifficultyLevel.EXPERT]: '#ef4444'
  };
  return colors[difficulty];
};

/**
 * Get region color for visual consistency
 */
export const getRegionColor = (region: CaliforniaRegion): string => {
  const colors = {
    [CaliforniaRegion.ALL]: '#6b7280',
    [CaliforniaRegion.BAY_AREA]: '#3b82f6',
    [CaliforniaRegion.SOUTHERN]: '#f59e0b',
    [CaliforniaRegion.NORTHERN]: '#10b981',
    [CaliforniaRegion.CENTRAL]: '#8b5cf6',
    [CaliforniaRegion.CENTRAL_VALLEY]: '#f97316',
    [CaliforniaRegion.COASTAL]: '#06b6d4',
    [CaliforniaRegion.INLAND]: '#84cc16'
  };
  return colors[region];
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Generate random rotation for expert mode
 */
export const getRandomRotation = (seed: string): number => {
  // Use string hash as seed for consistent rotation
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate rotation (0, 90, 180, 270)
  return (Math.abs(hash) % 4) * 90;
};

/**
 * Check if position is within bounds
 */
export const isWithinBounds = (
  position: Position,
  bounds: { x: number; y: number; width: number; height: number }
): boolean => {
  return position.x >= bounds.x &&
         position.x <= bounds.x + bounds.width &&
         position.y >= bounds.y &&
         position.y <= bounds.y + bounds.height;
};

/**
 * Clamp position to bounds
 */
export const clampPosition = (
  position: Position,
  bounds: { x: number; y: number; width: number; height: number }
): Position => {
  return {
    x: Math.max(bounds.x, Math.min(position.x, bounds.x + bounds.width)),
    y: Math.max(bounds.y, Math.min(position.y, bounds.y + bounds.height))
  };
};

/**
 * Get appropriate label for county piece based on difficulty
 */
export const getCountyLabel = (county: County, difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case DifficultyLevel.EASY:
      return county.name.substring(0, 4);
    case DifficultyLevel.MEDIUM:
      return county.name.substring(0, 3);
    case DifficultyLevel.HARD:
      return county.name.substring(0, 2);
    case DifficultyLevel.EXPERT:
      return '?';
    default:
      return county.name.substring(0, 3);
  }
};

/**
 * Calculate grid layout for county tray
 */
export const calculateGridLayout = (
  containerWidth: number,
  itemCount: number,
  itemSize: number,
  padding: number = 8
) => {
  const availableWidth = containerWidth - padding * 2;
  const itemWithPadding = itemSize + padding;
  const cols = Math.floor(availableWidth / itemWithPadding);
  const rows = Math.ceil(itemCount / cols);

  return {
    cols: Math.max(1, cols),
    rows,
    itemSize,
    padding,
    totalWidth: cols * itemWithPadding + padding,
    totalHeight: rows * itemWithPadding + padding
  };
};

/**
 * Get grid position for item at index
 */
export const getGridPosition = (
  index: number,
  cols: number,
  itemSize: number,
  padding: number
): Position => {
  const row = Math.floor(index / cols);
  const col = index % cols;

  return {
    x: col * (itemSize + padding) + padding,
    y: row * (itemSize + padding) + padding
  };
};

/**
 * Debounce function for performance
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Smooth step interpolation (S-curve)
 */
export const smoothStep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Check if two rectangles overlap
 */
export const rectanglesOverlap = (
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean => {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
};

/**
 * Convert hex color to rgba with alpha
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get contrast color (black or white) for background
 */
export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
};