/**
 * Mobile Portrait Layout Component
 *
 * Optimized vertical layout for mobile portrait orientation.
 * Features:
 * - Map area: 60vh height (top section)
 * - County tray: 30vh height (bottom section, horizontal scroll)
 * - Bottom sheet overlay for county details
 * - Touch-optimized controls
 *
 * @see docs/MOBILE_PRD.md - Section: Portrait Layout (F-1)
 */

import React, { useState, useCallback } from 'react';
import type { DeviceInfo } from '../hooks/useDeviceInfo';
import { BottomSheet, BottomSheetState } from './BottomSheet';
import { LAYOUT_DIMENSIONS, TOUCH_TARGETS, DeviceType } from '../config/breakpoints';

/**
 * County item for the tray
 */
export interface CountyItem {
  /** County unique identifier */
  id: string;

  /** County display name */
  name: string;

  /** Whether county has been placed */
  placed: boolean;

  /** Optional thumbnail image */
  thumbnail?: string;
}

/**
 * Props for MobilePortraitLayout
 */
export interface MobilePortraitLayoutProps {
  /** Device information from useDeviceInfo hook */
  deviceInfo: DeviceInfo;

  /** Map component to render in top section */
  mapComponent: React.ReactNode;

  /** Array of counties for the bottom tray */
  counties: CountyItem[];

  /** Callback when county is selected from tray */
  onCountySelect?: (countyId: string) => void;

  /** Currently selected county ID */
  selectedCountyId?: string | null;

  /** Content to show in bottom sheet (county details) */
  bottomSheetContent?: React.ReactNode;

  /** Initial bottom sheet state */
  initialBottomSheetState?: BottomSheetState;

  /** Callback when bottom sheet state changes */
  onBottomSheetStateChange?: (state: BottomSheetState) => void;

  /** Header component (game controls, score, etc.) */
  header?: React.ReactNode;

  /** Additional className for custom styling */
  className?: string;

  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Get map height based on device type
 */
function getMapHeight(deviceType: DeviceType): string {
  switch (deviceType) {
    case DeviceType.SMALL_PHONE:
      return LAYOUT_DIMENSIONS.MAP_HEIGHT_PORTRAIT_SMALL;
    case DeviceType.MEDIUM_PHONE:
      return LAYOUT_DIMENSIONS.MAP_HEIGHT_PORTRAIT_MEDIUM;
    case DeviceType.LARGE_PHONE:
    default:
      return LAYOUT_DIMENSIONS.MAP_HEIGHT_PORTRAIT_LARGE;
  }
}

/**
 * Get county tray height based on device type
 */
function getCountyTrayHeight(deviceType: DeviceType): string {
  switch (deviceType) {
    case DeviceType.SMALL_PHONE:
      return LAYOUT_DIMENSIONS.COUNTY_TRAY_HEIGHT_SMALL;
    case DeviceType.MEDIUM_PHONE:
      return LAYOUT_DIMENSIONS.COUNTY_TRAY_HEIGHT_MEDIUM;
    case DeviceType.LARGE_PHONE:
    default:
      return LAYOUT_DIMENSIONS.COUNTY_TRAY_HEIGHT_LARGE;
  }
}

/**
 * Mobile Portrait Layout Component
 *
 * Vertical layout optimized for phone portrait orientation
 *
 * @example
 * ```tsx
 * <MobilePortraitLayout
 *   deviceInfo={deviceInfo}
 *   mapComponent={<CaliforniaMapCanvas />}
 *   counties={availableCounties}
 *   onCountySelect={handleCountySelect}
 *   bottomSheetContent={<CountyDetails county={selected} />}
 * />
 * ```
 */
export const MobilePortraitLayout: React.FC<MobilePortraitLayoutProps> = ({
  deviceInfo,
  mapComponent,
  counties,
  onCountySelect,
  selectedCountyId,
  bottomSheetContent,
  initialBottomSheetState = BottomSheetState.COLLAPSED,
  onBottomSheetStateChange,
  header,
  className = '',
  'data-testid': testId = 'mobile-portrait-layout',
}) => {
  const [bottomSheetState, setBottomSheetState] =
    useState<BottomSheetState>(initialBottomSheetState);

  const mapHeight = getMapHeight(deviceInfo.deviceType);
  const trayHeight = getCountyTrayHeight(deviceInfo.deviceType);

  /**
   * Handle county selection from tray
   */
  const handleCountyTap = useCallback(
    (countyId: string) => {
      onCountySelect?.(countyId);
    },
    [onCountySelect]
  );

  /**
   * Handle bottom sheet state changes
   */
  const handleBottomSheetStateChange = useCallback(
    (state: BottomSheetState) => {
      setBottomSheetState(state);
      onBottomSheetStateChange?.(state);
    },
    [onBottomSheetStateChange]
  );

  return (
    <div
      className={`mobile-portrait-layout ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
        paddingTop: LAYOUT_DIMENSIONS.SAFE_AREA_TOP,
        paddingBottom: LAYOUT_DIMENSIONS.SAFE_AREA_BOTTOM,
        paddingLeft: LAYOUT_DIMENSIONS.SAFE_AREA_LEFT,
        paddingRight: LAYOUT_DIMENSIONS.SAFE_AREA_RIGHT,
      }}
      data-testid={testId}
      data-orientation="portrait"
      data-device-type={deviceInfo.deviceType}
    >
      {/* Header (optional) */}
      {header && (
        <div
          className="mobile-portrait-layout__header"
          style={{
            flexShrink: 0,
            height: LAYOUT_DIMENSIONS.MOBILE_HEADER_HEIGHT,
            zIndex: 100,
          }}
          data-testid={`${testId}-header`}
        >
          {header}
        </div>
      )}

      {/* Map Area - Top 60vh */}
      <div
        className="mobile-portrait-layout__map"
        style={{
          flexShrink: 0,
          height: mapHeight,
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
        }}
        data-testid={`${testId}-map`}
      >
        {mapComponent}
      </div>

      {/* County Tray - Bottom 30vh with horizontal scroll */}
      <div
        className="mobile-portrait-layout__county-tray"
        style={{
          flexGrow: 1,
          height: trayHeight,
          width: '100%',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          alignItems: 'center',
          padding: '12px 8px',
          gap: '12px',
        }}
        data-testid={`${testId}-county-tray`}
      >
        {counties.map((county) => (
          <button
            key={county.id}
            className={`county-tray-item ${county.placed ? 'county-tray-item--placed' : ''} ${
              selectedCountyId === county.id ? 'county-tray-item--selected' : ''
            }`}
            onClick={() => handleCountyTap(county.id)}
            disabled={county.placed}
            style={{
              flexShrink: 0,
              width: TOUCH_TARGETS.OPTIMAL_SIZE,
              height: TOUCH_TARGETS.OPTIMAL_SIZE,
              minWidth: TOUCH_TARGETS.MIN_SIZE_AAA,
              minHeight: TOUCH_TARGETS.MIN_SIZE_AAA,
              borderRadius: 8,
              border: selectedCountyId === county.id ? '2px solid #1976d2' : '1px solid #ccc',
              backgroundColor: county.placed ? '#f5f5f5' : '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              cursor: county.placed ? 'not-allowed' : 'pointer',
              opacity: county.placed ? 0.5 : 1,
              transition: 'all 0.2s ease',
              boxShadow:
                selectedCountyId === county.id
                  ? '0 2px 8px rgba(25, 118, 210, 0.3)'
                  : '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            data-testid={`${testId}-county-${county.id}`}
            data-placed={county.placed}
            data-selected={selectedCountyId === county.id}
          >
            {county.thumbnail ? (
              <img
                src={county.thumbnail}
                alt={county.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: '10px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {county.name}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Sheet for County Details */}
      {bottomSheetContent && (
        <BottomSheet
          initialState={bottomSheetState}
          onStateChange={handleBottomSheetStateChange}
          showBackdrop={true}
          closeOnBackdropTap={true}
          enableSwipe={true}
          data-testid={`${testId}-bottom-sheet`}
        >
          {bottomSheetContent}
        </BottomSheet>
      )}
    </div>
  );
};

export default MobilePortraitLayout;
