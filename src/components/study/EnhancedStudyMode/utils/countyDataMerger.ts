import type { County } from '../../../../types/game-types';
import { californiaCounties } from '../../../../data/californiaCounties';

/**
 * Merges county data from multiple sources to create a complete County object.
 *
 * This utility function takes a basic County object and enriches it with comprehensive
 * data from the californiaCounties dataset. It performs intelligent matching using
 * multiple strategies (ID matching, name matching) to find the corresponding county data.
 *
 * @param county - The basic county object to be enriched
 * @returns A County object with merged data from californiaCounties, or the original
 *          county if no matching comprehensive data is found
 *
 * @example
 * ```typescript
 * const basicCounty = { id: 'los-angeles', name: 'Los Angeles', region: 'Southern' };
 * const enrichedCounty = getMergedCountyData(basicCounty);
 * // Returns county with additional fields: countySeat, established, economicFocus, etc.
 * ```
 *
 * Matching strategies (in order of priority):
 * 1. Normalized ID match (handles hyphens vs underscores)
 * 2. Direct ID match
 * 3. County name normalized to ID format
 * 4. Case-insensitive name match
 * 5. Name match without "County" suffix
 *
 * Merged fields include:
 * - countySeat: The administrative center of the county
 * - established: Year the county was established
 * - economicFocus: Primary economic sectors
 * - naturalFeatures: Notable geographic and natural features
 * - culturalLandmarks: Important cultural sites
 * - funFacts: Interesting trivia about the county
 * - population, area: Demographic data (if not present in original)
 * - capital/founded: Legacy field mappings
 */
export const getMergedCountyData = (county: County): County => {
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
