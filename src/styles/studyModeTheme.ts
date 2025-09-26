/**
 * Study Mode Theme Configuration
 * A cohesive, accessible color system for educational content
 */

export const studyModeTheme = {
  // Primary Blue Scale - Main brand color for governance/official content
  primary: {
    50: '#EFF6FF',   // Lightest background
    100: '#DBEAFE',  // Light background
    200: '#BFDBFE',  // Hover states
    300: '#93C5FD',  // Borders
    400: '#60A5FA',  // Secondary text
    500: '#3B82F6',  // Primary actions
    600: '#2563EB',  // Primary brand
    700: '#1D4ED8',  // Hover actions
    800: '#1E40AF',  // Dark text
    900: '#1E3A8A',  // Darkest text
  },

  // Neutral Gray Scale - For general UI and text
  neutral: {
    50: '#FAFAFA',   // Subtle backgrounds
    100: '#F4F4F5',  // Light backgrounds
    200: '#E4E4E7',  // Borders
    300: '#D4D4D8',  // Disabled
    400: '#A1A1AA',  // Placeholder text
    500: '#71717A',  // Secondary text
    600: '#52525B',  // Body text
    700: '#3F3F46',  // Headings
    800: '#27272A',  // Dark headings
    900: '#18181B',  // Darkest text
  },

  // Semantic Colors - With better meaning alignment
  semantic: {
    // Historical/Established - Warm sepia tones
    historical: {
      bg: '#FEF3E7',     // Warm cream background
      border: '#F5DEB3',  // Wheat border
      text: '#92400E',    // Dark amber text
      icon: '#D97706',    // Amber icon
    },

    // Geographic/Location - Earth tones
    location: {
      bg: '#F0F9FF',     // Sky blue background
      border: '#BAE6FD', // Light blue border
      text: '#075985',   // Deep blue text
      icon: '#0284C7',   // Blue icon
    },

    // Cultural/Notable - Deep purple for importance
    cultural: {
      bg: '#FAF5FF',     // Light purple background
      border: '#E9D5FF', // Purple border
      text: '#6B21A8',   // Deep purple text
      icon: '#9333EA',   // Purple icon
    },

    // Success states
    success: {
      bg: '#F0FDF4',     // Light green background
      border: '#BBF7D0', // Green border
      text: '#166534',   // Dark green text
      icon: '#16A34A',   // Green icon
    },

    // Warning/Attention
    warning: {
      bg: '#FEF3C7',     // Light amber background
      border: '#FDE68A', // Amber border
      text: '#92400E',   // Dark amber text
      icon: '#F59E0B',   // Amber icon
    },

    // Error states
    error: {
      bg: '#FEF2F2',     // Light red background
      border: '#FECACA', // Red border
      text: '#991B1B',   // Dark red text
      icon: '#DC2626',   // Red icon
    }
  },

  // Info Card Types - Consistent, accessible combinations
  infoCards: {
    governance: {
      bg: '#EFF6FF',     // primary.50
      border: '#BFDBFE', // primary.200
      text: '#1E40AF',   // primary.800
      label: '#2563EB',  // primary.600
      icon: '🏛️',
    },

    historical: {
      bg: '#FEF3E7',     // semantic.historical.bg
      border: '#F5DEB3', // semantic.historical.border
      text: '#92400E',   // semantic.historical.text
      label: '#B45309',  // Slightly darker for labels
      icon: '📅',
    },

    features: {
      bg: '#FAF5FF',     // semantic.cultural.bg
      border: '#E9D5FF', // semantic.cultural.border
      text: '#6B21A8',   // semantic.cultural.text
      label: '#7C3AED',  // Slightly lighter for labels
      icon: '⭐',
    },

    geography: {
      bg: '#F0FDF4',     // semantic.success.bg
      border: '#BBF7D0', // semantic.success.border
      text: '#166534',   // semantic.success.text
      label: '#15803D',  // Medium green for labels
      icon: '🏔️',
    },

    economy: {
      bg: '#FEF3C7',     // semantic.warning.bg
      border: '#FDE68A', // semantic.warning.border
      text: '#92400E',   // semantic.warning.text
      label: '#D97706',  // Medium amber for labels
      icon: '💼',
    }
  },

  // Typography Scale
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  // Spacing Scale
  spacing: {
    xs: '0.5rem',      // 8px
    sm: '0.75rem',     // 12px
    md: '1rem',        // 16px
    lg: '1.25rem',     // 20px
    xl: '1.5rem',      // 24px
    '2xl': '2rem',     // 32px
    '3xl': '3rem',     // 48px
  },

  // Border Radius
  borderRadius: {
    sm: '0.25rem',     // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    full: '9999px',    // Pills
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },

  // Transitions
  transition: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  }
};

// Helper function to ensure WCAG AA compliance
export const getContrastColor = (background: string): string => {
  // This is a simplified version - in production, calculate actual contrast
  const lightBackgrounds = ['#EFF6FF', '#FAFAFA', '#FEF3E7', '#F0F9FF', '#FAF5FF', '#F0FDF4', '#FEF3C7'];
  return lightBackgrounds.includes(background) ? studyModeTheme.neutral[800] : '#FFFFFF';
};

// Semantic color helpers
export const getInfoCardStyle = (type: keyof typeof studyModeTheme.infoCards) => {
  return studyModeTheme.infoCards[type] || studyModeTheme.infoCards.governance;
};

// Typography helpers
export const getHeadingStyle = (level: 1 | 2 | 3 | 4) => {
  const styles = {
    1: { fontSize: studyModeTheme.fontSize['3xl'], color: studyModeTheme.neutral[900], fontWeight: 700 },
    2: { fontSize: studyModeTheme.fontSize['2xl'], color: studyModeTheme.neutral[800], fontWeight: 600 },
    3: { fontSize: studyModeTheme.fontSize.xl, color: studyModeTheme.neutral[800], fontWeight: 600 },
    4: { fontSize: studyModeTheme.fontSize.lg, color: studyModeTheme.neutral[700], fontWeight: 500 },
  };
  return styles[level];
};