/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./docs/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      // California-themed color palette
      colors: {
        // Primary California Colors
        ca: {
          gold: {
            50: '#FFFEF7',   // ca-cream
            100: '#FFF8DC',  // light gold wash
            200: '#FFE55C',  // pale gold
            300: '#FFD700',  // california gold
            400: '#E6C200',  // rich gold
            500: '#CC9900',  // deep gold
            600: '#B8860B',  // dark gold
            700: '#996600',  // bronze gold
            800: '#7A5200',  // antique gold
            900: '#5C3D00',  // darkest gold
          },

          sunset: {
            50: '#FFF5F0',   // very light peach
            100: '#FFE8D6',  // light peach
            200: '#FFD1B3',  // soft peach
            300: '#FFB380',  // warm peach
            400: '#FF9966',  // medium sunset
            500: '#FF6B35',  // california sunset
            600: '#E55A2B',  // deep sunset
            700: '#CC4921',  // rich sunset
            800: '#B23818',  // dark sunset
            900: '#992710',  // darkest sunset
          },

          ocean: {
            50: '#F0F8FF',   // very light blue
            100: '#E6F3FF',  // ice blue
            200: '#CCE7FF',  // pale blue
            300: '#B3D9FF',  // light blue
            400: '#87CEEB',  // sky blue
            500: '#0077BE',  // pacific ocean
            600: '#005C8F',  // deep ocean
            700: '#004466',  // navy blue
            800: '#003347',  // dark navy
            900: '#002233',  // deepest navy
          },

          redwood: {
            50: '#FDF2F1',   // very light brown
            100: '#F7E1DD',  // light tan
            200: '#E8C5BB',  // pale brown
            300: '#D4A59A',  // light redwood
            400: '#B8846F',  // medium redwood
            500: '#A0522D',  // california redwood
            600: '#8B4513',  // saddle brown
            700: '#723B0F',  // dark brown
            800: '#5A2F0C',  // deep brown
            900: '#412208',  // darkest brown
          },

          poppy: {
            50: '#FFF7F0',   // very light orange
            100: '#FFEEE0',  // light cream
            200: '#FFD6B8',  // pale orange
            300: '#FFB380',  // light poppy
            400: '#FF9966',  // medium poppy
            500: '#FF8C00',  // california poppy
            600: '#E67A00',  // deep poppy
            700: '#CC6600',  // rich orange
            800: '#B35200',  // dark orange
            900: '#993D00',  // darkest orange
          },
        },

        // Supporting Colors
        sky: {
          50: '#F8FBFF',
          100: '#F0F8FF',
          200: '#E6F3FF',
          300: '#CCE7FF',
          400: '#B3D9FF',
          500: '#87CEEB',  // california sky
          600: '#5DADE2',
          700: '#3498DB',
          800: '#2980B9',
          900: '#1F618D',
        },

        desert: {
          50: '#FDF9F3',
          100: '#FAF0E6',
          200: '#F5E6CC',
          300: '#EFDBAA',
          400: '#E8CD88',
          500: '#DEB887',  // mojave desert
          600: '#D4A672',
          700: '#C8945D',
          800: '#B8844A',
          900: '#A17437',
        },

        vineyard: {
          50: '#F7F4F4',
          100: '#EDE6E6',
          200: '#DBC7C7',
          300: '#C8A8A8',
          400: '#B58989',
          500: '#722F37',  // napa valley wine
          600: '#662A33',
          700: '#59252E',
          800: '#4D2029',
          900: '#401B24',
        },

        tech: {
          50: '#F4F3FF',
          100: '#EBE9FE',
          200: '#D6D2FE',
          300: '#B8B0FD',
          400: '#9084FC',
          500: '#6366F1',  // silicon valley tech
          600: '#5B5FCF',
          700: '#4F46E5',
          800: '#4338CA',
          900: '#3730A3',
        },

        fog: {
          50: '#FAFAFA',
          100: '#F5F5F5',  // san francisco fog
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },

        // Neutral Extended
        charcoal: {
          50: '#F7FAFC',
          100: '#EDF2F7',
          200: '#E2E8F0',
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',  // california charcoal
          800: '#1A202C',
          900: '#171923',
        },
      },

      // California-inspired gradients
      backgroundImage: {
        'ca-sunset': 'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
        'ca-ocean': 'linear-gradient(135deg, #0077BE 0%, #87CEEB 100%)',
        'ca-redwood': 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
        'ca-tech': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'ca-desert': 'linear-gradient(135deg, #DEB887 0%, #F4A460 100%)',
        'ca-gold-shine': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
        'ca-poppy-bloom': 'linear-gradient(135deg, #FF8C00 0%, #FF6B35 50%, #FF8C00 100%)',
        'ca-coastal': 'linear-gradient(135deg, #87CEEB 0%, #0077BE 50%, #1E40AF 100%)',

        // Complex gradients for special effects
        'ca-dawn': 'linear-gradient(135deg, #FFE4E1 0%, #FFB6C1 25%, #FF69B4 50%, #FF1493 75%, #DC143C 100%)',
        'ca-dusk': 'linear-gradient(135deg, #4B0082 0%, #8B008B 25%, #FF4500 50%, #FFD700 75%, #FFFFE0 100%)',
        'ca-golden-hour': 'linear-gradient(135deg, #FF6B35 0%, #FF8C00 25%, #FFD700 50%, #FFFFE0 100%)',
      },

      // Typography - System fonts only
      fontFamily: {
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },

      fontSize: {
        // Consistent type scale: 12px, 14px, 16px, 20px, 24px
        'xs': ['0.75rem', { lineHeight: '1.2' }],   // 12px
        'sm': ['0.875rem', { lineHeight: '1.3' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5' }],    // 16px
        'lg': ['1.25rem', { lineHeight: '1.4' }],   // 20px
        'xl': ['1.5rem', { lineHeight: '1.3' }],    // 24px
      },

      // Spacing system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },

      // Box shadows with California warmth
      boxShadow: {
        'ca-sm': '0 1px 2px 0 rgba(255, 107, 53, 0.05)',
        'ca-md': '0 4px 6px -1px rgba(255, 107, 53, 0.1), 0 2px 4px -1px rgba(255, 107, 53, 0.06)',
        'ca-lg': '0 10px 15px -3px rgba(255, 107, 53, 0.1), 0 4px 6px -2px rgba(255, 107, 53, 0.05)',
        'ca-xl': '0 20px 25px -5px rgba(255, 107, 53, 0.1), 0 10px 10px -5px rgba(255, 107, 53, 0.04)',
        'ca-2xl': '0 25px 50px -12px rgba(255, 107, 53, 0.25)',
        'ca-inner': 'inset 0 2px 4px 0 rgba(255, 107, 53, 0.06)',

        // Gold shadows
        'gold-sm': '0 1px 2px 0 rgba(255, 215, 0, 0.1)',
        'gold-md': '0 4px 6px -1px rgba(255, 215, 0, 0.15), 0 2px 4px -1px rgba(255, 215, 0, 0.1)',
        'gold-lg': '0 10px 15px -3px rgba(255, 215, 0, 0.2), 0 4px 6px -2px rgba(255, 215, 0, 0.15)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1)',

        // Ocean shadows
        'ocean-sm': '0 1px 2px 0 rgba(0, 119, 190, 0.05)',
        'ocean-md': '0 4px 6px -1px rgba(0, 119, 190, 0.1), 0 2px 4px -1px rgba(0, 119, 190, 0.06)',
        'ocean-lg': '0 10px 15px -3px rgba(0, 119, 190, 0.1), 0 4px 6px -2px rgba(0, 119, 190, 0.05)',
        'ocean-glow': '0 0 20px rgba(0, 119, 190, 0.2), 0 0 40px rgba(0, 119, 190, 0.1)',
      },

      // Animation and transitions
      animation: {
        'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
        'ca-float': 'ca-float 3s ease-in-out infinite',
        'ca-glow': 'ca-glow 2s ease-in-out infinite alternate',
        'ca-shimmer': 'ca-shimmer 2s linear infinite',
        'ca-bounce-in': 'ca-bounce-in 0.6s ease-out',
        'ca-slide-up': 'ca-slide-up 0.4s ease-out',
        'ca-fade-in': 'ca-fade-in 0.3s ease-out',
        'ca-scale-in': 'ca-scale-in 0.2s ease-out',
      },

      keyframes: {
        'gentle-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.8' },
        },
        'ca-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'ca-glow': {
          '0%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.4)' },
        },
        'ca-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'ca-bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'ca-slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'ca-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ca-scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // Custom screens for California-specific layouts
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',

        // Device-specific breakpoints
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
        'wide': {'min': '1920px'},
      },

      // Z-index scale
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
        'modal': '1000',
        'tooltip': '1010',
        'notification': '1020',
        'dropdown': '1030',
        'overlay': '1040',
        'max': '9999',
      },

      // Custom utilities for California design
      aspectRatio: {
        'ca-map': '16 / 10',
        'county-card': '4 / 3',
        'achievement': '1 / 1',
        'hero': '21 / 9',
      },

      // Backdrop blur
      backdropBlur: {
        'ca-light': '2px',
        'ca-medium': '8px',
        'ca-heavy': '20px',
      },

      // Custom transformations
      scale: {
        '102': '1.02',
        '103': '1.03',
        '97': '0.97',
        '98': '0.98',
      },

      // Custom opacity values
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
    },
  },
  plugins: [
    // Custom plugin for California-specific utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // California gradient text
        '.text-ca-gradient': {
          background: 'linear-gradient(135deg, #FFD700 0%, #FF6B35 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },

        // California glow effects
        '.glow-ca-gold': {
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1)',
        },
        '.glow-ca-sunset': {
          boxShadow: '0 0 20px rgba(255, 107, 53, 0.3), 0 0 40px rgba(255, 107, 53, 0.1)',
        },
        '.glow-ca-ocean': {
          boxShadow: '0 0 20px rgba(0, 119, 190, 0.3), 0 0 40px rgba(0, 119, 190, 0.1)',
        },

        // Map interaction utilities
        '.map-county-default': {
          fill: theme('colors.fog.100'),
          stroke: theme('colors.ocean.500'),
          strokeWidth: '1px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        },
        '.map-county-hover': {
          fill: theme('colors.sky.400'),
          stroke: theme('colors.sunset.500'),
          strokeWidth: '2px',
          filter: 'drop-shadow(0 4px 8px rgba(255, 107, 53, 0.3))',
        },
        '.map-county-selected': {
          fill: theme('colors.ca.poppy.500'),
          stroke: theme('colors.ca.redwood.500'),
          strokeWidth: '3px',
        },
        '.map-county-completed': {
          fill: theme('colors.ca.gold.300'),
          stroke: theme('colors.ca.vineyard.500'),
          strokeWidth: '2px',
        },

        // Loading skeleton utilities
        '.skeleton-ca': {
          background: `linear-gradient(90deg, ${theme('colors.fog.100')} 25%, ${theme('colors.sky.200')} 50%, ${theme('colors.fog.100')} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'ca-shimmer 1.5s infinite',
        },

        // Glass morphism effects
        '.glass-ca': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-ca-dark': {
          background: 'rgba(45, 55, 72, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(45, 55, 72, 0.2)',
        },

        // Button variants
        '.btn-ca-primary': {
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          color: 'white',
          border: 'none',
          borderRadius: theme('borderRadius.xl'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontWeight: theme('fontWeight.semibold'),
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
          },
        },
        '.btn-ca-secondary': {
          background: 'linear-gradient(135deg, #FFD700 0%, #FF6B35 100%)',
          color: 'white',
          border: 'none',
          borderRadius: theme('borderRadius.xl'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          fontWeight: theme('fontWeight.semibold'),
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(255, 215, 0, 0.4)',
          },
        },

        // Accessibility utilities
        '.focus-ca': {
          '&:focus': {
            outline: `3px solid ${theme('colors.ca.tech.500')}`,
            outlineOffset: '2px',
          },
        },
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
      };

      addUtilities(newUtilities);
    },

    // Additional plugins for enhanced functionality
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],

  // Dark mode configuration
  darkMode: 'class',

  // Safelist important classes to prevent purging
  safelist: [
    // Color variations
    'text-ca-gold-300',
    'text-ca-gold-500',
    'text-ca-sunset-500',
    'text-ca-ocean-500',
    'bg-ca-gold-100',
    'bg-ca-sunset-100',
    'bg-ca-ocean-100',

    // Animation classes
    'animate-ca-float',
    'animate-ca-glow',
    'animate-gentle-pulse',

    // Map interaction classes
    'map-county-default',
    'map-county-hover',
    'map-county-selected',
    'map-county-completed',

    // Grid responsive classes
    {
      pattern: /ca-grid-(cols|sm|md|lg|xl)-(1|2|3|4|5|6)/,
    },

    // California gradient classes
    {
      pattern: /bg-ca-(sunset|ocean|redwood|tech|desert|gold-shine|poppy-bloom|coastal)/,
    },
  ],
};