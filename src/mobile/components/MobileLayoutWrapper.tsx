/**
 * Mobile Layout Wrapper Component
 *
 * Intelligent layout selector that automatically chooses between portrait
 * and landscape layouts based on device orientation and screen size.
 * Falls back to desktop layout for non-mobile devices.
 *
 * @see docs/MOBILE_PRD.md - Section: Responsive Layout System
 */

import React, { useMemo } from 'react';
import { useDeviceInfo } from '../hooks/useDeviceInfo';
import type { DeviceInfo } from '../hooks/useDeviceInfo';
import { MobilePortraitLayout } from './MobilePortraitLayout';
import type { MobilePortraitLayoutProps } from './MobilePortraitLayout';
import { MobileLandscapeLayout } from './MobileLandscapeLayout';
import type { MobileLandscapeLayoutProps } from './MobileLandscapeLayout';
import { Orientation } from '../config/breakpoints';

/**
 * Layout mode determined by wrapper
 */
// eslint-disable-next-line react-refresh/only-export-components
export enum LayoutMode {
  MOBILE_PORTRAIT = 'mobile-portrait',
  MOBILE_LANDSCAPE = 'mobile-landscape',
  DESKTOP = 'desktop',
}

/**
 * Props for MobileLayoutWrapper
 *
 * Combines props from both portrait and landscape layouts,
 * plus fallback desktop layout.
 */
export interface MobileLayoutWrapperProps {
  /** Map component (used in all layouts) */
  mapComponent: React.ReactNode;

  /** Counties array (used in all layouts) */
  counties: MobilePortraitLayoutProps['counties'];

  /** County selection callback (used in all layouts) */
  onCountySelect?: (countyId: string) => void;

  /** Selected county ID (used in all layouts) */
  selectedCountyId?: string | null;

  /** Desktop layout fallback (when not mobile/tablet) */
  desktopLayout?: React.ReactNode;

  /** Portrait-specific props */
  portraitProps?: Partial<MobilePortraitLayoutProps>;

  /** Landscape-specific props */
  landscapeProps?: Partial<MobileLandscapeLayoutProps>;

  /** Force specific layout mode (bypasses automatic detection) */
  forceLayoutMode?: LayoutMode;

  /** Callback when layout mode changes */
  onLayoutModeChange?: (mode: LayoutMode, deviceInfo: DeviceInfo) => void;

  /** Additional className */
  className?: string;

  /** Test ID */
  'data-testid'?: string;
}

/**
 * Determine which layout mode to use based on device info
 */
function determineLayoutMode(deviceInfo: DeviceInfo, forceMode?: LayoutMode): LayoutMode {
  // If forced mode specified, use it
  if (forceMode) {
    return forceMode;
  }

  // Desktop devices always use desktop layout
  if (deviceInfo.isDesktop) {
    return LayoutMode.DESKTOP;
  }

  // Mobile and tablet devices use orientation-based layouts
  if (deviceInfo.orientation === Orientation.PORTRAIT) {
    return LayoutMode.MOBILE_PORTRAIT;
  } else {
    return LayoutMode.MOBILE_LANDSCAPE;
  }
}

/**
 * Mobile Layout Wrapper Component
 *
 * Automatically selects the appropriate layout based on device orientation,
 * screen size, and device type. Handles smooth transitions when orientation changes.
 *
 * @example
 * ```tsx
 * <MobileLayoutWrapper
 *   mapComponent={<CaliforniaMapCanvas />}
 *   counties={availableCounties}
 *   onCountySelect={handleCountySelect}
 *   selectedCountyId={selectedId}
 *   desktopLayout={<DesktopGameLayout />}
 *   portraitProps={{
 *     header: <GameHeader />,
 *     bottomSheetContent: <CountyDetails />,
 *   }}
 *   landscapeProps={{
 *     controlPanelHeader: <GameScore />,
 *     controlPanelFooter: <ActionButtons />,
 *   }}
 * />
 * ```
 */
export const MobileLayoutWrapper: React.FC<MobileLayoutWrapperProps> = ({
  mapComponent,
  counties,
  onCountySelect,
  selectedCountyId,
  desktopLayout,
  portraitProps = {},
  landscapeProps = {},
  forceLayoutMode,
  onLayoutModeChange,
  className = '',
  'data-testid': testId = 'mobile-layout-wrapper',
}) => {
  // Get current device information
  const deviceInfo = useDeviceInfo();

  // Determine which layout mode to use
  const layoutMode = useMemo(
    () => determineLayoutMode(deviceInfo, forceLayoutMode),
    [deviceInfo, forceLayoutMode]
  );

  // Notify parent when layout mode changes
  React.useEffect(() => {
    onLayoutModeChange?.(layoutMode, deviceInfo);
  }, [layoutMode, deviceInfo, onLayoutModeChange]);

  // Render appropriate layout based on mode
  const renderLayout = () => {
    switch (layoutMode) {
      case LayoutMode.MOBILE_PORTRAIT:
        return (
          <MobilePortraitLayout
            deviceInfo={deviceInfo}
            mapComponent={mapComponent}
            counties={counties}
            onCountySelect={onCountySelect}
            selectedCountyId={selectedCountyId}
            className={className}
            data-testid={`${testId}-portrait`}
            {...portraitProps}
          />
        );

      case LayoutMode.MOBILE_LANDSCAPE:
        return (
          <MobileLandscapeLayout
            deviceInfo={deviceInfo}
            mapComponent={mapComponent}
            counties={counties}
            onCountySelect={onCountySelect}
            selectedCountyId={selectedCountyId}
            className={className}
            data-testid={`${testId}-landscape`}
            {...landscapeProps}
          />
        );

      case LayoutMode.DESKTOP:
      default:
        return (
          <div
            className={`mobile-layout-wrapper__desktop ${className}`}
            data-testid={`${testId}-desktop`}
          >
            {desktopLayout || (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p>Desktop layout not provided. Rendering default view.</p>
                {mapComponent}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div
      className={`mobile-layout-wrapper mobile-layout-wrapper--${layoutMode} ${className}`}
      data-testid={testId}
      data-layout-mode={layoutMode}
      data-orientation={deviceInfo.orientation}
      data-device-type={deviceInfo.deviceType}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {renderLayout()}
    </div>
  );
};

export default MobileLayoutWrapper;
