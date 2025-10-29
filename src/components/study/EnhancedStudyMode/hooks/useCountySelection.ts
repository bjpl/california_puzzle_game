/**
 * useCountySelection Hook
 * Manages county selection state and data merging for EnhancedStudyMode
 *
 * Extracted from EnhancedStudyMode.tsx to improve code organization
 * and reusability.
 */

import { useState, useEffect } from 'react';
import type { County } from '../../../../types/game-types';
import { californiaCounties } from '../../../../data/californiaCounties';
import { useSoundEffect } from '../../../../utils/simpleSoundManager';
import type { CountySelectionHookReturn } from '../types';

/**
 * Helper function to merge county data from multiple sources
 * Enriches basic county data with comprehensive information from californiaCounties
 *
 * @param county - The base county data to enrich
 * @returns Merged county data with comprehensive fields
 */
const getMergedCountyData = (county: County): County => {
  // Try to find matching data from californiaCounties.ts by name matching
  const normalizedId = county.id.toLowerCase().replace(/-/g, '_');
  const comprehensiveData = californiaCounties.find((c) => {
    const cId = c.id.toLowerCase();
    const countyId = county.id.toLowerCase();
    const countyName = county.name.toLowerCase().replace(' county', '').replace(/\s+/g, '_');

    return (
      cId === normalizedId ||
      cId === countyId ||
      cId === countyName ||
      c.name.toLowerCase() === county.name.toLowerCase() ||
      c.name.toLowerCase().replace(' county', '') === county.name.toLowerCase()
    );
  });

  if (comprehensiveData) {
    // Merge the comprehensive data with the county
    return {
      ...county,
      // Keep original fields but add comprehensive data
      countySeat: comprehensiveData.countySeat,
      established: comprehensiveData.established?.toString(),
      economicFocus: comprehensiveData.economicFocus,
      naturalFeatures: comprehensiveData.naturalFeatures,
      culturalLandmarks: comprehensiveData.culturalLandmarks,
      funFacts: comprehensiveData.funFacts,
      // Preserve original fields if they exist
      capital: county.capital || comprehensiveData.countySeat,
      founded: county.founded || comprehensiveData.established,
      population: county.population || comprehensiveData.population,
      area: county.area || comprehensiveData.area,
    } as County;
  }

  // Return original county data if no match found
  return county;
};

/**
 * Custom hook for managing county selection in study mode
 *
 * Features:
 * - Manages selected county state
 * - Enriches county data with comprehensive information
 * - Auto-selects first county on mount
 * - Plays sound effect on selection
 *
 * @param counties - Array of counties to manage
 * @returns County selection state and handlers
 */
export const useCountySelection = (counties: County[]): CountySelectionHookReturn => {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const sound = useSoundEffect();

  // Auto-select first county on load with merged data
  useEffect(() => {
    if (counties.length > 0 && !selectedCounty) {
      const firstCounty = counties[0];
      // Check if county already has the data we need
      if (firstCounty.capital && firstCounty.population) {
        setSelectedCounty(firstCounty);
      } else {
        const mergedCounty = getMergedCountyData(firstCounty);
        setSelectedCounty(mergedCounty);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counties]);

  /**
   * Select a county and enrich it with comprehensive data
   * Plays a sound effect on selection
   *
   * @param county - County to select
   */
  const selectCounty = (county: County) => {
    // Check if county already has the data we need (from californiaCountiesComplete.ts)
    if (county.capital && county.population && county.area && county.founded) {
      setSelectedCounty(county);
    } else {
      const mergedCounty = getMergedCountyData(county);
      setSelectedCounty(mergedCounty);
    }

    // Play selection sound effect
    sound.playSound('select');
  };

  /**
   * Clear the selected county
   */
  const clearSelection = () => {
    setSelectedCounty(null);
  };

  return {
    selectedCounty,
    selectCounty,
    clearSelection,
  };
};
