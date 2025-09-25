# California Counties Explorer - Design System Guidelines

## Core Philosophy: Authentic Topographic Explorer

**Design Identity**: Vintage National Parks map aesthetic with modern usability
**Personality**: Educational explorer, not gamified app
**Constraint**: Minimal, purposeful, accessible

## Design Principles

### 1. Authenticity Over Polish
- Intentional imperfections (hand-drawn borders)
- No gradients (except ONE for completion celebration)
- No decorative animations
- No emojis in UI

### 2. Accessibility First
- WCAG AA compliance minimum
- High contrast ratios (4.5:1 for normal text, 3:1 for large)
- Focus indicators on ALL interactive elements
- Keyboard navigation support
- Screen reader friendly

### 3. Performance Through Simplicity
- Maximum 2 shadow levels
- No unnecessary transitions
- Static by default, animated only for critical feedback
- Semantic HTML wherever possible

## Visual Language

### Color System (Topographic Palette)

```css
/* Primary Palette - Accessible California */
--topo-sand: #F4E8D0;      /* Background - Light */
--topo-clay: #C2714F;      /* Accent - Medium contrast */
--topo-sage: #9CAF88;      /* Success states */
--topo-ocean: #4A7C83;     /* Interactive elements */
--topo-ink: #2C1810;       /* Text - High contrast */

/* Semantic Colors */
--success: #3B5F3B;        /* Correct placement (ranger green) */
--warning: #D4623C;        /* Incorrect/attention (sunset) */
--focus: #0066CC;          /* Keyboard focus (WCAG blue) */
--disabled: #767676;       /* Disabled state (WCAG gray) */

/* Contrast Ratios (WCAG AA) */
/* topo-ink on topo-sand: 12.8:1 ✓ */
/* topo-ocean on white: 4.6:1 ✓ */
/* success on white: 5.8:1 ✓ */
```

### Typography System

```css
/* Single Font Family */
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;
--font-mono: 'SF Mono', 'Consolas', monospace;

/* Type Scale (1.25 ratio - Major Third) */
--text-xs: 0.75rem;   /* 12px - Labels */
--text-sm: 0.875rem;  /* 14px - Body small */
--text-base: 1rem;    /* 16px - Body default */
--text-lg: 1.25rem;   /* 20px - Headings */
--text-xl: 1.5rem;    /* 24px - Titles */

/* Line Heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.65;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-bold: 600;  /* Max weight for readability */
```

### Spacing System (8px Grid)

```css
/* Consistent spacing scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### Component Patterns

#### Buttons
```css
.btn {
  /* Base */
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: 4px;
  border: 2px solid transparent;

  /* Accessibility */
  min-height: 44px;  /* Touch target */
  min-width: 44px;

  /* Focus */
  outline-offset: 2px;
}

.btn:focus-visible {
  outline: 2px solid var(--focus);
}

/* Primary Action */
.btn-primary {
  background: var(--topo-ocean);
  color: white;
  border-color: var(--topo-ocean);
}

/* Secondary Action */
.btn-secondary {
  background: transparent;
  color: var(--topo-ocean);
  border-color: currentColor;
}
```

#### Cards
```css
.card {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  padding: var(--space-4);
  /* Single shadow level */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* NO hover shadows or transforms */
```

#### Map Elements
```css
.county-boundary {
  fill: transparent;
  stroke: var(--topo-clay);
  stroke-width: 1;
  stroke-dasharray: none;  /* Solid when empty */
}

.county-boundary.placed {
  fill: var(--topo-sage);
  stroke: var(--success);
  stroke-width: 1.5;
}

.county-boundary.dragging {
  opacity: 0.8;
  cursor: grabbing;
}

/* Accessible focus indicator for keyboard nav */
.county-boundary:focus {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
```

### Interaction Patterns

#### Allowed Animations (3 Total)
1. **Drag Feedback**: Opacity change only (0.8 when dragging)
2. **Placement Success**: 300ms ease-out settle animation
3. **Game Complete**: ONE gradient shimmer celebration

#### Hover States
- Color change only (no shadows, no scale)
- Must maintain contrast ratios
- Consistent across all interactive elements

#### Focus Management
- Visible focus indicators on ALL interactive elements
- Logical tab order
- Focus trap in modals
- Return focus on modal close

### Accessibility Requirements

#### Color & Contrast
- Text: 4.5:1 minimum contrast ratio
- UI Components: 3:1 minimum contrast ratio
- Don't rely on color alone for information
- Test with color blindness simulators

#### Keyboard Support
- All interactive elements keyboard accessible
- Visible focus indicators
- Escape key closes modals
- Arrow keys for map navigation (future)

#### Screen Readers
- Semantic HTML structure
- ARIA labels for icons
- Live regions for game updates
- Alternative text for visual elements

#### Motion & Animations
- Respect prefers-reduced-motion
- Provide pause/stop controls for animations
- No auto-playing animations over 5 seconds

### Anti-Patterns to Avoid

❌ **NEVER USE:**
- Gradients (except completion celebration)
- Emojis in UI text
- Multiple font families
- Shadow elevation systems
- Hover scale transforms
- Color transitions on interaction
- Decorative animations
- Border-radius > 8px
- Font weights > 600
- Opacity < 0.8 for interactive elements

### Implementation Checklist

For each component:
- [ ] Meets color contrast requirements
- [ ] Has keyboard support
- [ ] Has focus indicators
- [ ] Uses semantic HTML
- [ ] Follows spacing grid
- [ ] No unnecessary animations
- [ ] Single purpose, clear hierarchy
- [ ] Tested with screen reader
- [ ] Responsive without media queries
- [ ] Under 100 lines of styles

## Component-Specific Guidelines

### Map Component
- Ghost outlines for unplaced counties
- Solid fills for placed counties
- NO drop shadows
- NO gradients
- Clear focus states

### Modal Component
- Focus trap enabled
- Escape key handling
- Return focus on close
- Maximum width constraint
- Scroll internal content, not page

### County Cards
- Text hierarchy through weight only
- Single border style
- NO shadows or elevation
- Clear disabled state

### Study Mode
- High contrast for readability
- Clear section separation
- No decorative elements
- Focus on content

## Testing Requirements

1. **Contrast Testing**: Use WebAIM contrast checker
2. **Keyboard Testing**: Navigate without mouse
3. **Screen Reader**: Test with NVDA/JAWS
4. **Performance**: < 100ms interaction response
5. **Mobile**: Touch targets minimum 44x44px

## Version History

- v1.0.0 - Initial design system (eliminating AI patterns)
- Focus: Accessibility, authenticity, performance