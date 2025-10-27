/**
 * useMediaQuery Hook
 *
 * React hook for responsive design using CSS media queries.
 * Provides real-time updates when media query matches change.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);
 * const prefersReducedMotion = useMediaQuery(MEDIA_QUERIES.reducedMotion);
 * ```
 */

import { useState, useEffect } from 'react';

/**
 * Hook to track media query matches
 *
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @param defaultValue - Default value if matchMedia is not available (SSR)
 * @returns True if media query matches, false otherwise
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Server-side rendering or environments without matchMedia
    if (typeof window === 'undefined' || !window.matchMedia) {
      return defaultValue;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Skip if matchMedia not available
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Update state if initial value is different
    if (mediaQuery.matches !== matches) {
      setMatches(mediaQuery.matches);
    }

    // Handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query, matches]);

  return matches;
}

/**
 * Hook to track multiple media queries
 *
 * @param queries - Object with media query strings
 * @returns Object with boolean values for each query
 *
 * @example
 * ```tsx
 * const breakpoints = useMediaQueries({
 *   isMobile: MEDIA_QUERIES.mobile,
 *   isTablet: MEDIA_QUERIES.tablet,
 *   isTouch: MEDIA_QUERIES.touch,
 * });
 * // breakpoints = { isMobile: true, isTablet: false, isTouch: true }
 * ```
 */
export function useMediaQueries<T extends Record<string, string>>(
  queries: T
): Record<keyof T, boolean> {
  const [matches, setMatches] = useState<Record<keyof T, boolean>>(() => {
    const initialMatches = {} as Record<keyof T, boolean>;

    for (const key in queries) {
      if (typeof window !== 'undefined' && window.matchMedia) {
        initialMatches[key] = window.matchMedia(queries[key]).matches;
      } else {
        initialMatches[key] = false;
      }
    }

    return initialMatches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQueries: Record<keyof T, MediaQueryList> = {} as Record<keyof T, MediaQueryList>;
    const handlers: Record<keyof T, (event: MediaQueryListEvent) => void> = {} as Record<
      keyof T,
      (event: MediaQueryListEvent) => void
    >;

    // Set up listeners for each query
    for (const key in queries) {
      const mq = window.matchMedia(queries[key]);
      mediaQueries[key] = mq;

      handlers[key] = (event: MediaQueryListEvent) => {
        setMatches((prev) => ({
          ...prev,
          [key]: event.matches,
        }));
      };

      mq.addEventListener('change', handlers[key]);
    }

    // Cleanup
    return () => {
      for (const key in queries) {
        const mq = mediaQueries[key];
        const handler = handlers[key];
        mq.removeEventListener('change', handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - queries object reference should be stable

  return matches;
}

export default useMediaQuery;
