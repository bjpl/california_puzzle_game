import { getRegionColor } from '../../../../config/regionColors';

/**
 * Gets the Tailwind gradient classes for a given region
 *
 * This function maps California region names to their corresponding
 * Tailwind CSS gradient classes for consistent styling across the application.
 * The gradient classes are centralized in the regionColors configuration.
 *
 * @param region - The name of the California region (e.g., "Northern", "Central Coast", "Southern")
 * @returns A string containing Tailwind gradient utility classes (e.g., "from-blue-500 to-blue-600")
 *
 * @example
 * ```tsx
 * const gradient = getRegionGradient("Northern");
 * // Returns: "from-blue-500 to-blue-600"
 *
 * <div className={`bg-gradient-to-r ${gradient}`}>
 *   Northern Region
 * </div>
 * ```
 */
export const getRegionGradient = (region: string): string => {
  const colorConfig = getRegionColor(region);
  return colorConfig.tailwindGradient;
};
