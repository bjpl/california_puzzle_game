/**
 * Skip Navigation Link Component
 *
 * Implements WCAG 2.1 Level AAA compliance:
 * - 2.4.1 Bypass Blocks: Skip navigation mechanism
 * - 2.4.8 Location: Skip link to main content
 *
 * This component provides a keyboard-accessible link to skip repetitive
 * navigation and jump directly to the main content area.
 *
 * Features:
 * - Hidden until focused (Tab key)
 * - First focusable element on page
 * - High contrast colors for visibility
 * - Smooth focus transition to main content
 */

/**
 * SkipNavigation Component
 *
 * Provides a keyboard-accessible skip link to main content.
 * Should be the first child in your app layout.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <>
 *       <SkipNavigation />
 *       <header>...</header>
 *       <main id="main-content" tabIndex={-1}>...</main>
 *     </>
 *   );
 * }
 * ```
 */
export default function SkipNavigation() {
  const handleSkipClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    // Find main content element
    const mainContent = document.getElementById('main-content');

    if (mainContent) {
      // Set focus to main content
      mainContent.focus();

      // Scroll to main content smoothly
      mainContent.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Announce to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Skipped to main content';

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleSkipClick}
      className="skip-navigation"
      style={{
        position: 'absolute',
        top: '-40px',
        left: '0',
        zIndex: 10000,
        padding: '12px 24px',
        backgroundColor: '#0052CC', // High contrast blue
        color: '#FFFFFF',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '16px',
        borderRadius: '0 0 4px 0',
        transition: 'top 0.2s ease-in-out',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        outline: 'none',
      }}
    >
      Skip to main content

      <style>{`
        /* Visually hide skip link until focused */
        .skip-navigation {
          position: absolute;
          top: -40px;
          left: 0;
        }

        /* Show skip link when focused (Tab key) */
        .skip-navigation:focus {
          top: 0;
          outline: 3px solid #FF0000; /* Red focus indicator for AAA */
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .skip-navigation {
            border: 2px solid currentColor;
          }

          .skip-navigation:focus {
            outline-width: 4px;
          }
        }

        /* Ensure it's above everything */
        .skip-navigation {
          z-index: 10000 !important;
        }

        /* Screen reader only class */
        .sr-only {
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
      `}</style>
    </a>
  );
}
