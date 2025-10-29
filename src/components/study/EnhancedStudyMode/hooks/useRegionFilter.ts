/**
 * useRegionFilter Hook
 * Manages region filtering with quiz state awareness
 */

import { useState } from 'react';
import type { RegionFilterHookReturn, QuizState } from '../types';

export function useRegionFilter(quizState: QuizState): RegionFilterHookReturn {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showRegionChangeModal, setShowRegionChangeModal] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<string>('');

  /**
   * Request a region change
   * If quiz is active, shows confirmation modal
   * Otherwise, changes region directly
   */
  const requestRegionChange = (region: string) => {
    if (quizState === 'active') {
      // Store the pending region and show modal
      setPendingRegion(region);
      setShowRegionChangeModal(true);
    } else {
      // Not in active quiz, change directly
      setSelectedRegion(region);
    }
  };

  /**
   * Confirm region change (after modal confirmation)
   * Sets the region and closes the modal
   */
  const confirmRegionChange = () => {
    setSelectedRegion(pendingRegion);
    setShowRegionChangeModal(false);
    setPendingRegion('');
  };

  /**
   * Cancel region change
   * Closes the modal and clears pending region
   */
  const cancelRegionChange = () => {
    setShowRegionChangeModal(false);
    setPendingRegion('');
  };

  return {
    selectedRegion,
    setSelectedRegion,
    showRegionChangeModal,
    pendingRegion,
    requestRegionChange,
    confirmRegionChange,
    cancelRegionChange,
  };
}
