/**
 * useContentNavigation Hook
 *
 * Manages content tab navigation and modal visibility for the Enhanced Study Mode.
 * Handles switching between different content tabs (overview, history, economy, culture, geography, memory)
 * and controls the display of educational and county details modals.
 */

import { useState } from 'react';
import type { ContentTab, ContentNavigationHookReturn } from '../types';

/**
 * Custom hook for managing content navigation state in Enhanced Study Mode
 *
 * @returns {ContentNavigationHookReturn} Object containing content tab state and modal controls
 *
 * @example
 * ```tsx
 * const {
 *   contentTab,
 *   setContentTab,
 *   showEducationalModal,
 *   openEducationalModal,
 *   closeEducationalModal,
 *   showCountyDetailsModal,
 *   openCountyDetailsModal,
 *   closeCountyDetailsModal
 * } = useContentNavigation();
 * ```
 */
export function useContentNavigation(): ContentNavigationHookReturn {
  // Content tab state - controls which content section is currently displayed
  const [contentTab, setContentTab] = useState<ContentTab>('overview');

  // Modal visibility states
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [showCountyDetailsModal, setShowCountyDetailsModal] = useState(false);

  /**
   * Opens the educational content modal
   */
  const openEducationalModal = (): void => {
    setShowEducationalModal(true);
  };

  /**
   * Closes the educational content modal
   */
  const closeEducationalModal = (): void => {
    setShowEducationalModal(false);
  };

  /**
   * Opens the county details modal
   */
  const openCountyDetailsModal = (): void => {
    setShowCountyDetailsModal(true);
  };

  /**
   * Closes the county details modal
   */
  const closeCountyDetailsModal = (): void => {
    setShowCountyDetailsModal(false);
  };

  return {
    contentTab,
    setContentTab,
    showEducationalModal,
    showCountyDetailsModal,
    openEducationalModal,
    closeEducationalModal,
    openCountyDetailsModal,
    closeCountyDetailsModal,
  };
}
