/**
 * |unit|integration|accessibility|performance|
 * Mobile Layout Wrapper Component Tests
 *
 * Comprehensive test suite for responsive layout wrapper.
 * Tests auto layout selection, orientation handling, and viewport changes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MobileLayoutWrapper, LayoutMode } from '@/mobile/components/MobileLayoutWrapper';
import { Orientation, DeviceType } from '@/mobile/config/breakpoints';
import type { DeviceInfo } from '@/mobile/hooks/useDeviceInfo';
import type { County } from '@/types';
import { act } from 'react';

// Mock device info hook (375px = MEDIUM_PHONE)
let mockDeviceInfo: DeviceInfo = {
  width: 375,
  height: 667,
  deviceType: DeviceType.MEDIUM_PHONE,
  orientation: Orientation.PORTRAIT,
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  isTouch: true,
  reducedMotion: false,
  darkMode: false,
  pixelRatio: 2,
  isPortrait: true,
  isLandscape: false,
};

vi.mock('@/mobile/hooks/useDeviceInfo', () => ({
  useDeviceInfo: vi.fn(() => mockDeviceInfo),
}));

// Mock layout components
vi.mock('@/mobile/components/MobilePortraitLayout', () => ({
  MobilePortraitLayout: ({ children, 'data-testid': testId }: Record<string, unknown>) => (
    <div data-testid={(testId as string) || 'mobile-portrait-layout'}>
      {children as React.ReactNode}
    </div>
  ),
}));

vi.mock('@/mobile/components/MobileLandscapeLayout', () => ({
  MobileLandscapeLayout: ({ children, 'data-testid': testId }: Record<string, unknown>) => (
    <div data-testid={(testId as string) || 'mobile-landscape-layout'}>
      {children as React.ReactNode}
    </div>
  ),
}));

describe('MobileLayoutWrapper Component', () => {
  const mockCounties: County[] = [
    {
      id: 'county-1',
      name: 'County One',
      fips: '06001',
      location: { lat: 37.0, lon: -120.0 },
      area: 1000,
      population: 100000,
      slug: 'county-one',
    },
    {
      id: 'county-2',
      name: 'County Two',
      fips: '06002',
      location: { lat: 38.0, lon: -121.0 },
      area: 1500,
      population: 150000,
      slug: 'county-two',
    },
  ];

  const mockMapComponent = <div data-testid="map-component">Map</div>;
  const mockDesktopLayout = <div data-testid="desktop-layout">Desktop Layout</div>;
  const mockOnCountySelect = vi.fn();
  const mockOnLayoutModeChange = vi.fn();

  const defaultProps = {
    mapComponent: mockMapComponent,
    counties: mockCounties,
    onCountySelect: mockOnCountySelect,
    onLayoutModeChange: mockOnLayoutModeChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to default mobile portrait (375px = MEDIUM_PHONE)
    mockDeviceInfo = {
      width: 375,
      height: 667,
      deviceType: DeviceType.MEDIUM_PHONE,
      orientation: Orientation.PORTRAIT,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouch: true,
      reducedMotion: false,
      darkMode: false,
      pixelRatio: 2,
      isPortrait: true,
      isLandscape: false,
    };
  });

  describe('|unit| Rendering and Layout Mode', () => {
    it('should render wrapper container', () => {
      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper')).toBeInTheDocument();
    });

    it('should apply custom test ID', () => {
      render(<MobileLayoutWrapper {...defaultProps} data-testid="custom-wrapper" />);

      expect(screen.getByTestId('custom-wrapper')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<MobileLayoutWrapper {...defaultProps} className="custom-class" />);

      const wrapper = screen.getByTestId('mobile-layout-wrapper');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should include layout mode in CSS class', () => {
      render(<MobileLayoutWrapper {...defaultProps} />);

      const wrapper = screen.getByTestId('mobile-layout-wrapper');
      expect(wrapper).toHaveClass('mobile-layout-wrapper--mobile-portrait');
    });

    it('should include data attributes for layout info', () => {
      render(<MobileLayoutWrapper {...defaultProps} />);

      const wrapper = screen.getByTestId('mobile-layout-wrapper');
      expect(wrapper).toHaveAttribute('data-layout-mode', LayoutMode.MOBILE_PORTRAIT);
      expect(wrapper).toHaveAttribute('data-orientation', Orientation.PORTRAIT);
      expect(wrapper).toHaveAttribute('data-device-type', DeviceType.MEDIUM_PHONE);
    });

    it('should have full width and height with overflow hidden', () => {
      render(<MobileLayoutWrapper {...defaultProps} />);

      const wrapper = screen.getByTestId('mobile-layout-wrapper');
      expect(wrapper).toHaveStyle({
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      });
    });
  });

  describe('|unit| Auto Layout Selection - Portrait', () => {
    it('should select portrait layout for mobile in portrait (320px width)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 320,
        height: 568,
        deviceType: DeviceType.SMALL_PHONE,
        orientation: Orientation.PORTRAIT,
        isMobile: true,
        isPortrait: true,
        isLandscape: false,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-landscape')).not.toBeInTheDocument();
    });

    it('should select portrait layout for mobile in portrait (375px width)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 375,
        height: 667,
        orientation: Orientation.PORTRAIT,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
    });

    it('should select portrait layout for tablet in portrait (768px width)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 768,
        height: 1024,
        deviceType: DeviceType.SMALL_TABLET,
        orientation: Orientation.PORTRAIT,
        isMobile: false,
        isTablet: true,
        isPortrait: true,
        isLandscape: false,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
    });
  });

  describe('|unit| Auto Layout Selection - Landscape', () => {
    it('should select landscape layout for mobile in landscape (667px width)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 667,
        height: 375,
        deviceType: DeviceType.LARGE_PHONE,
        orientation: Orientation.LANDSCAPE,
        isPortrait: false,
        isLandscape: true,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-landscape')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-portrait')).not.toBeInTheDocument();
    });

    it('should select landscape layout for tablet in landscape (1024px width)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 1024,
        height: 768,
        deviceType: DeviceType.LARGE_TABLET,
        orientation: Orientation.LANDSCAPE,
        isMobile: false,
        isTablet: true,
        isPortrait: false,
        isLandscape: true,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-landscape')).toBeInTheDocument();
    });
  });

  describe('|unit| Auto Layout Selection - Desktop', () => {
    it('should select desktop layout for desktop devices (1280px width)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 1280,
        height: 720,
        deviceType: DeviceType.DESKTOP,
        orientation: Orientation.LANDSCAPE,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isPortrait: false,
        isLandscape: true,
      };

      render(<MobileLayoutWrapper {...defaultProps} desktopLayout={mockDesktopLayout} />);

      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-portrait')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-landscape')).not.toBeInTheDocument();
    });

    it('should show default desktop view when desktopLayout not provided', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 1920,
        height: 1080,
        deviceType: DeviceType.DESKTOP,
        isDesktop: true,
        isMobile: false,
        isTablet: false,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      const desktopWrapper = screen.getByTestId('mobile-layout-wrapper-desktop');
      expect(desktopWrapper).toBeInTheDocument();
      expect(
        screen.getByText('Desktop layout not provided. Rendering default view.')
      ).toBeInTheDocument();
      expect(screen.getByTestId('map-component')).toBeInTheDocument();
    });
  });

  describe('|integration| Forced Layout Mode Override', () => {
    it('should force portrait layout when forceLayoutMode is MOBILE_PORTRAIT', () => {
      // Device is desktop, but force mobile portrait
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 1280,
        height: 720,
        deviceType: DeviceType.DESKTOP,
        isDesktop: true,
        isMobile: false,
      };

      render(
        <MobileLayoutWrapper {...defaultProps} forceLayoutMode={LayoutMode.MOBILE_PORTRAIT} />
      );

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-desktop')).not.toBeInTheDocument();
    });

    it('should force landscape layout when forceLayoutMode is MOBILE_LANDSCAPE', () => {
      // Device is mobile portrait, but force landscape
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 375,
        height: 667,
        orientation: Orientation.PORTRAIT,
      };

      render(
        <MobileLayoutWrapper {...defaultProps} forceLayoutMode={LayoutMode.MOBILE_LANDSCAPE} />
      );

      expect(screen.getByTestId('mobile-layout-wrapper-landscape')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-portrait')).not.toBeInTheDocument();
    });

    it('should force desktop layout when forceLayoutMode is DESKTOP', () => {
      // Device is mobile, but force desktop
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 375,
        height: 667,
        isMobile: true,
      };

      render(
        <MobileLayoutWrapper
          {...defaultProps}
          forceLayoutMode={LayoutMode.DESKTOP}
          desktopLayout={mockDesktopLayout}
        />
      );

      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-portrait')).not.toBeInTheDocument();
    });
  });

  describe('|integration| Orientation Change Handling', () => {
    it('should switch from portrait to landscape on orientation change', async () => {
      const { rerender } = render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();

      // Simulate orientation change
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 667,
        height: 375,
        orientation: Orientation.LANDSCAPE,
        isPortrait: false,
        isLandscape: true,
      };

      await act(async () => {
        rerender(<MobileLayoutWrapper {...defaultProps} />);
      });

      expect(screen.getByTestId('mobile-layout-wrapper-landscape')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-portrait')).not.toBeInTheDocument();
    });

    it('should switch from landscape to portrait on orientation change', async () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 667,
        height: 375,
        orientation: Orientation.LANDSCAPE,
        isPortrait: false,
        isLandscape: true,
      };

      const { rerender } = render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-landscape')).toBeInTheDocument();

      // Simulate orientation change
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 375,
        height: 667,
        orientation: Orientation.PORTRAIT,
        isPortrait: true,
        isLandscape: false,
      };

      await act(async () => {
        rerender(<MobileLayoutWrapper {...defaultProps} />);
      });

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
      expect(screen.queryByTestId('mobile-layout-wrapper-landscape')).not.toBeInTheDocument();
    });

    it('should maintain desktop layout regardless of orientation', async () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 1280,
        height: 720,
        deviceType: DeviceType.DESKTOP,
        isDesktop: true,
        isMobile: false,
        isTablet: false,
        orientation: Orientation.LANDSCAPE,
      };

      const { rerender } = render(
        <MobileLayoutWrapper {...defaultProps} desktopLayout={mockDesktopLayout} />
      );

      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();

      // Change orientation (uncommon for desktop, but test robustness)
      mockDeviceInfo = {
        ...mockDeviceInfo,
        orientation: Orientation.PORTRAIT,
        isPortrait: true,
        isLandscape: false,
      };

      await act(async () => {
        rerender(<MobileLayoutWrapper {...defaultProps} desktopLayout={mockDesktopLayout} />);
      });

      // Should still be desktop
      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    });
  });

  describe('|integration| Layout Change Callbacks', () => {
    it('should call onLayoutModeChange when layout mode changes', async () => {
      const { rerender } = render(<MobileLayoutWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnLayoutModeChange).toHaveBeenCalledWith(
          LayoutMode.MOBILE_PORTRAIT,
          mockDeviceInfo
        );
      });

      // Change to landscape
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 667,
        height: 375,
        orientation: Orientation.LANDSCAPE,
        isPortrait: false,
        isLandscape: true,
      };

      await act(async () => {
        rerender(<MobileLayoutWrapper {...defaultProps} />);
      });

      await waitFor(() => {
        expect(mockOnLayoutModeChange).toHaveBeenCalledWith(
          LayoutMode.MOBILE_LANDSCAPE,
          mockDeviceInfo
        );
      });
    });

    it('should call onLayoutModeChange with device info', async () => {
      render(<MobileLayoutWrapper {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnLayoutModeChange).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            width: expect.any(Number),
            height: expect.any(Number),
            deviceType: expect.any(String),
            orientation: expect.any(String),
          })
        );
      });
    });

    it('should handle missing onLayoutModeChange callback', () => {
      const { unmount } = render(
        <MobileLayoutWrapper
          mapComponent={mockMapComponent}
          counties={mockCounties}
          onLayoutModeChange={undefined}
        />
      );

      expect(screen.getByTestId('mobile-layout-wrapper')).toBeInTheDocument();
      unmount();
    });
  });

  describe('|integration| Viewport Size Variations', () => {
    it('should handle small mobile viewport (320px)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 320,
        height: 568,
        deviceType: DeviceType.SMALL_PHONE,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
    });

    it('should handle standard mobile viewport (375px)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 375,
        height: 667,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
    });

    it('should handle large mobile viewport (414px)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 414,
        height: 896,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
    });

    it('should handle tablet viewport (768px)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 768,
        height: 1024,
        deviceType: DeviceType.SMALL_TABLET,
        isMobile: false,
        isTablet: true,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
    });

    it('should handle large tablet viewport (1024px landscape)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 1024,
        height: 768,
        deviceType: DeviceType.LARGE_TABLET,
        orientation: Orientation.LANDSCAPE,
        isMobile: false,
        isTablet: true,
        isPortrait: false,
        isLandscape: true,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-landscape')).toBeInTheDocument();
    });

    it('should handle desktop viewport (1280px)', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 1280,
        height: 720,
        deviceType: DeviceType.DESKTOP,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };

      render(<MobileLayoutWrapper {...defaultProps} desktopLayout={mockDesktopLayout} />);

      expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
    });
  });

  describe('|integration| Props Forwarding', () => {
    it('should forward portrait-specific props to MobilePortraitLayout', () => {
      const portraitProps = {
        header: <div>Custom Header</div>,
        bottomSheetContent: <div>Sheet Content</div>,
      };

      render(<MobileLayoutWrapper {...defaultProps} portraitProps={portraitProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
    });

    it('should forward landscape-specific props to MobileLandscapeLayout', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 667,
        height: 375,
        orientation: Orientation.LANDSCAPE,
        isPortrait: false,
        isLandscape: true,
      };

      const landscapeProps = {
        controlPanelHeader: <div>Control Header</div>,
        controlPanelFooter: <div>Control Footer</div>,
      };

      render(<MobileLayoutWrapper {...defaultProps} landscapeProps={landscapeProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper-landscape')).toBeInTheDocument();
    });

    it('should forward common props to all layouts', () => {
      render(
        <MobileLayoutWrapper
          {...defaultProps}
          selectedCountyId="county-1"
          className="shared-class"
        />
      );

      expect(screen.getByTestId('mobile-layout-wrapper-portrait')).toBeInTheDocument();
    });
  });

  describe('|accessibility| Semantic Structure', () => {
    it('should maintain semantic structure in all layouts', () => {
      render(<MobileLayoutWrapper {...defaultProps} />);

      const wrapper = screen.getByTestId('mobile-layout-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('should expose layout mode for assistive technologies', () => {
      render(<MobileLayoutWrapper {...defaultProps} />);

      const wrapper = screen.getByTestId('mobile-layout-wrapper');
      expect(wrapper).toHaveAttribute('data-layout-mode');
    });
  });

  describe('|performance| Layout Switching Performance', () => {
    it('should efficiently switch layouts without unnecessary re-renders', async () => {
      const { rerender } = render(<MobileLayoutWrapper {...defaultProps} />);

      // Switch between layouts rapidly
      for (let i = 0; i < 5; i++) {
        mockDeviceInfo = {
          ...mockDeviceInfo,
          orientation: i % 2 === 0 ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
          isPortrait: i % 2 === 0,
          isLandscape: i % 2 !== 0,
          width: i % 2 === 0 ? 375 : 667,
          height: i % 2 === 0 ? 667 : 375,
        };

        await act(async () => {
          rerender(<MobileLayoutWrapper {...defaultProps} />);
        });
      }

      const wrapper = screen.getByTestId('mobile-layout-wrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('should memoize layout determination logic', () => {
      const { rerender } = render(<MobileLayoutWrapper {...defaultProps} />);

      // Re-render with same device info
      rerender(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper')).toBeInTheDocument();
    });
  });

  describe('|integration| Edge Cases', () => {
    it('should handle undefined counties array', () => {
      render(
        <MobileLayoutWrapper
          mapComponent={mockMapComponent}
          counties={undefined as unknown as County[]}
          onCountySelect={mockOnCountySelect}
        />
      );

      expect(screen.getByTestId('mobile-layout-wrapper')).toBeInTheDocument();
    });

    it('should handle empty counties array', () => {
      render(
        <MobileLayoutWrapper
          mapComponent={mockMapComponent}
          counties={[]}
          onCountySelect={mockOnCountySelect}
        />
      );

      expect(screen.getByTestId('mobile-layout-wrapper')).toBeInTheDocument();
    });

    it('should handle missing optional callbacks', () => {
      render(
        <MobileLayoutWrapper
          mapComponent={mockMapComponent}
          counties={mockCounties}
          onCountySelect={undefined}
          onLayoutModeChange={undefined}
        />
      );

      expect(screen.getByTestId('mobile-layout-wrapper')).toBeInTheDocument();
    });

    it('should handle extreme aspect ratios', () => {
      mockDeviceInfo = {
        ...mockDeviceInfo,
        width: 200,
        height: 1000,
      };

      render(<MobileLayoutWrapper {...defaultProps} />);

      expect(screen.getByTestId('mobile-layout-wrapper')).toBeInTheDocument();
    });
  });
});
