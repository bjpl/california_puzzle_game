/**
 * Mobile Landscape Layout Component
 *
 * Optimized horizontal layout for tablets in landscape orientation.
 * Features:
 * - Map area: 70vw width (left side)
 * - Control panel: 30vw width (right sidebar)
 * - County grid in control panel
 * - Optimized for larger screens in landscape
 *
 * @see docs/MOBILE_PRD.md - Section: Landscape Layout (F-2)
 */

import React, { useCallback } from 'react';
import type { DeviceInfo } from '../hooks/useDeviceInfo';
import type { CountyItem } from './MobilePortraitLayout';
import { LAYOUT_DIMENSIONS, TOUCH_TARGETS, BREAKPOINTS } from '../config/breakpoints';

/**
 * Props for MobileLandscapeLayout
 */
export interface MobileLandscapeLayoutProps {
  /** Device information from useDeviceInfo hook */
  deviceInfo: DeviceInfo;

  /** Map component to render in left section */
  mapComponent: React.ReactNode;

  /** Array of counties for the control panel */
  counties: CountyItem[];

  /** Callback when county is selected */
  onCountySelect?: (countyId: string) => void;

  /** Currently selected county ID */
  selectedCountyId?: string | null;

  /** Control panel header (game info, score, etc.) */
  controlPanelHeader?: React.ReactNode;

  /** Control panel footer (actions, buttons) */
  controlPanelFooter?: React.ReactNode;

  /** Additional content in control panel above county grid */
  controlPanelContent?: React.ReactNode;

  /** Additional className for custom styling */
  className?: string;

  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Get control panel width based on screen size
 */
function getControlPanelWidth(width: number): string {
  if (width >= BREAKPOINTS.LARGE_TABLET) {
    return '25vw'; // Narrower on large tablets
  }
  return LAYOUT_DIMENSIONS.MAP_WIDTH_LANDSCAPE === '70vw' ? '30vw' : '30vw';
}

/**
 * Get county grid columns based on panel width
 */
function getGridColumns(width: number): number {
  if (width >= BREAKPOINTS.LARGE_TABLET) {
    return 3; // 3 columns on large tablets
  }
  return 2; // 2 columns on small tablets
}

/**
 * Mobile Landscape Layout Component
 *
 * Horizontal split-screen layout optimized for tablet landscape orientation
 *
 * @example
 * ```tsx
 * <MobileLandscapeLayout
 *   deviceInfo={deviceInfo}
 *   mapComponent={<CaliforniaMapCanvas />}
 *   counties={availableCounties}
 *   onCountySelect={handleCountySelect}
 *   controlPanelHeader={<GameScore />}
 *   controlPanelFooter={<ActionButtons />}
 * />
 * ```
 */
export const MobileLandscapeLayout: React.FC<MobileLandscapeLayoutProps> = ({
  deviceInfo,
  mapComponent,
  counties,
  onCountySelect,
  selectedCountyId,
  controlPanelHeader,
  controlPanelFooter,
  controlPanelContent,
  className = '',
  'data-testid': testId = 'mobile-landscape-layout',
}) => {
  const controlPanelWidth = getControlPanelWidth(deviceInfo.width);
  const gridColumns = getGridColumns(deviceInfo.width);

  /**
   * Handle county selection
   */
  const handleCountyTap = useCallback(
    (countyId: string) => {
      onCountySelect?.(countyId);
    },
    [onCountySelect]
  );

  return (
    <div
      className={`mobile-landscape-layout ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
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
      data-orientation="landscape"
      data-device-type={deviceInfo.deviceType}
    >
      {/* Map Area - Left 70vw */}
      <div
        className="mobile-landscape-layout__map"
        style={{
          flexShrink: 0,
          width: LAYOUT_DIMENSIONS.MAP_WIDTH_LANDSCAPE,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#f0f0f0',
        }}
        data-testid={`${testId}-map`}
      >
        {mapComponent}
      </div>

      {/* Control Panel - Right 30vw */}
      <div
        className="mobile-landscape-layout__control-panel"
        style={{
          flexGrow: 1,
          width: controlPanelWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
        data-testid={`${testId}-control-panel`}
      >
        {/* Control Panel Header */}
        {controlPanelHeader && (
          <div
            className="mobile-landscape-layout__control-panel-header"
            style={{
              flexShrink: 0,
              padding: '16px',
              borderBottom: '1px solid #e0e0e0',
            }}
            data-testid={`${testId}-control-panel-header`}
          >
            {controlPanelHeader}
          </div>
        )}

        {/* Control Panel Content (optional) */}
        {controlPanelContent && (
          <div
            className="mobile-landscape-layout__control-panel-content"
            style={{
              flexShrink: 0,
              padding: '16px',
              borderBottom: '1px solid #e0e0e0',
            }}
            data-testid={`${testId}-control-panel-content`}
          >
            {controlPanelContent}
          </div>
        )}

        {/* County Grid - Scrollable */}
        <div
          className="mobile-landscape-layout__county-grid"
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            padding: '16px',
          }}
          data-testid={`${testId}-county-grid`}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
              gap: '12px',
            }}
          >
            {counties.map((county) => (
              <button
                key={county.id}
                className={`county-grid-item ${county.placed ? 'county-grid-item--placed' : ''} ${
                  selectedCountyId === county.id ? 'county-grid-item--selected' : ''
                }`}
                onClick={() => handleCountyTap(county.id)}
                disabled={county.placed}
                style={{
                  aspectRatio: '1',
                  minHeight: TOUCH_TARGETS.MIN_SIZE_AAA,
                  borderRadius: 8,
                  border: selectedCountyId === county.id ? '2px solid #1976d2' : '1px solid #ccc',
                  backgroundColor: county.placed ? '#f5f5f5' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
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
                      width: '80%',
                      height: '80%',
                      objectFit: 'contain',
                      marginBottom: 4,
                    }}
                  />
                ) : null}
                <span
                  style={{
                    fontSize: '12px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.2',
                  }}
                >
                  {county.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Control Panel Footer */}
        {controlPanelFooter && (
          <div
            className="mobile-landscape-layout__control-panel-footer"
            style={{
              flexShrink: 0,
              padding: '16px',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#fafafa',
            }}
            data-testid={`${testId}-control-panel-footer`}
          >
            {controlPanelFooter}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLandscapeLayout;
