/**
 * Unified type system for California Counties Game
 * This file consolidates all game-related types to avoid conflicts
 */

import type * as GeoJSON from 'geojson';

// ========================================
// Base County Types (Simple data structure)
// ========================================

/**
 * Simple County type for basic game data from californiaCountiesComplete.ts
 * Used in GameContext and most UI components
 */
export interface SimpleCounty {
  id: string;
  name: string;
  region: string;
  capital: string;
  population: number;
  area: number;
  founded: number;
  difficulty: 'easy' | 'medium' | 'hard';
  funFact: string;
}

/**
 * Extended County type with optional geographic data
 * Used when geographic precision is needed (maps, placement)
 */
export interface ExtendedCounty extends SimpleCounty {
  fips?: string;
  geometry?: GeoJSON.Geometry;
  centroid?: [number, number];
  // Additional optional fields
  countySeat?: string;
  established?: string;
  funFacts?: string[];
  naturalFeatures?: string[];
  economicFocus?: string[];
  culturalLandmarks?: string[];
  knownFor?: string;
}

/**
 * County piece for drag-and-drop gameplay
 */
export interface GameCountyPiece extends ExtendedCounty {
  isPlaced: boolean;
  currentPosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  rotation: number;
  scale: number;
  zIndex: number;
}

// ========================================
// Type Aliases for Backward Compatibility
// ========================================

/**
 * Default County type - uses ExtendedCounty (with optional geo fields)
 * This makes it compatible with both SimpleCounty and full County from types/index.ts
 */
export type County = ExtendedCounty;

/**
 * CountyPiece for game mechanics
 */
export type CountyPiece = GameCountyPiece;

// ========================================
// Utility Types and Converters
// ========================================

/**
 * Convert SimpleCounty to ExtendedCounty
 */
export function toExtendedCounty(county: SimpleCounty): ExtendedCounty {
  return {
    ...county,
    fips: '00000', // Default FIPS code if not provided
    geometry: undefined,
    centroid: [0, 0],
  };
}

/**
 * Convert any county type to GameCountyPiece
 */
export function toCountyPiece(
  county: SimpleCounty | ExtendedCounty,
  index: number = 0
): GameCountyPiece {
  const extended = 'geometry' in county ? county : toExtendedCounty(county);
  return {
    ...extended,
    fips: extended.fips || '00000', // Ensure fips is always defined
    isPlaced: false,
    currentPosition: { x: 0, y: 0 },
    targetPosition: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    zIndex: index,
  };
}

/**
 * Type guard to check if county has geographic data
 */
export function hasGeographicData(county: SimpleCounty | ExtendedCounty): county is ExtendedCounty {
  return 'geometry' in county && county.geometry != null;
}

// ========================================
// Re-export common types from other files
// ========================================

export type { Position, PlacementResult, GameState, GameSettings } from '../types';
export type { CaliforniaRegion, DifficultyLevel, HintType } from '../types';
