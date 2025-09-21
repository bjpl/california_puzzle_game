# California-Themed UI/UX Design Specification

## 🌟 Overview

This document outlines the comprehensive UI/UX design for the California Counties Puzzle Game, featuring a modern California-inspired aesthetic that blends tech innovation with natural beauty.

## 🎨 Visual Theme & Color Palette

### Primary Color Palette

```css
/* California Golden State Colors */
--ca-gold: #FFD700;           /* California Gold Rush */
--ca-sunset: #FF6B35;         /* Pacific Sunset */
--ca-ocean: #0077BE;          /* Pacific Ocean Blue */
--ca-redwood: #A0522D;        /* Redwood Forest */
--ca-poppy: #FF8C00;          /* California Poppy */

/* Supporting Colors */
--ca-sky: #87CEEB;            /* California Sky */
--ca-desert: #DEB887;         /* Mojave Desert Sand */
--ca-vineyard: #722F37;       /* Napa Valley Wine */
--ca-tech: #6366F1;           /* Silicon Valley Tech */
--ca-fog: #F5F5F5;            /* San Francisco Fog */

/* Neutral Palette */
--ca-charcoal: #2D3748;       /* Dark text */
--ca-slate: #4A5568;          /* Medium text */
--ca-gray: #718096;           /* Light text */
--ca-white: #FFFFFF;          /* Pure white */
--ca-cream: #FFFEF7;          /* Warm white */
```

### Gradient Definitions

```css
/* Signature California Gradients */
--ca-sunset-gradient: linear-gradient(135deg, #FF6B35 0%, #FFD700 100%);
--ca-ocean-gradient: linear-gradient(135deg, #0077BE 0%, #87CEEB 100%);
--ca-redwood-gradient: linear-gradient(135deg, #A0522D 0%, #8B4513 100%);
--ca-tech-gradient: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
--ca-desert-gradient: linear-gradient(135deg, #DEB887 0%, #F4A460 100%);
```

## 🏔️ Design Motifs & Iconography

### Bear Flag Republic Elements
- **California Republic Bear**: Stylized geometric bear silhouette
- **Red Star**: Five-pointed star from the flag
- **Red Stripe**: Horizontal accent element
- **Typography**: "California Republic" font styling

### Natural California Icons
- **Redwood Trees**: Tall, majestic tree silhouettes
- **Golden Poppies**: State flower illustrations
- **Mountain Ranges**: Sierra Nevada-inspired peaks
- **Pacific Waves**: Ocean wave patterns
- **Desert Cacti**: Minimalist cactus forms
- **Vineyard Vines**: Grape leaf patterns

### Tech-Modern Elements
- **Circuit Patterns**: Subtle tech-inspired backgrounds
- **Geometric Shapes**: Clean, modern abstractions
- **Grid Systems**: Organized, systematic layouts
- **Gradient Overlays**: Smooth color transitions

## 🗺️ Map Styling & Topography

### Interactive Map Design

```css
/* Map Container */
.ca-map-container {
  background: var(--ca-cream);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(45, 55, 72, 0.1);
  position: relative;
  overflow: hidden;
}

/* County Regions */
.county-region {
  fill: var(--ca-fog);
  stroke: var(--ca-ocean);
  stroke-width: 1px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.county-region:hover {
  fill: var(--ca-sky);
  stroke: var(--ca-sunset);
  stroke-width: 2px;
  filter: drop-shadow(0 4px 8px rgba(255, 107, 53, 0.3));
}

.county-region.completed {
  fill: var(--ca-gold);
  stroke: var(--ca-vineyard);
}

.county-region.selected {
  fill: var(--ca-poppy);
  stroke: var(--ca-redwood);
  stroke-width: 3px;
}
```

### Topographical Features

```css
/* Mountain Ranges */
.mountain-range {
  fill: url(#mountainGradient);
  opacity: 0.7;
}

/* Water Bodies */
.water-body {
  fill: var(--ca-ocean);
  opacity: 0.8;
}

/* Desert Regions */
.desert-region {
  fill: var(--ca-desert);
  opacity: 0.6;
}

/* Urban Areas */
.urban-area {
  fill: var(--ca-tech);
  opacity: 0.5;
}
```

## 🃏 County Card Components

### Card Design Specification

```jsx
// County Card Component Structure
<div className="county-card">
  <div className="card-header">
    <img src={countyImage} alt={countyName} className="county-image" />
    <div className="county-badge">
      <StarIcon className="county-star" />
    </div>
  </div>

  <div className="card-content">
    <h3 className="county-name">{countyName}</h3>
    <p className="county-description">{description}</p>

    <div className="county-stats">
      <div className="stat-item">
        <MapIcon />
        <span>{area} sq mi</span>
      </div>
      <div className="stat-item">
        <UsersIcon />
        <span>{population}</span>
      </div>
    </div>

    <div className="difficulty-indicator">
      <span className="difficulty-label">Difficulty:</span>
      <div className="difficulty-stars">
        {/* Star rating display */}
      </div>
    </div>
  </div>

  <div className="card-footer">
    <button className="play-button">
      <PlayIcon />
      Play Puzzle
    </button>
  </div>
</div>
```

### County Card Styling

```css
.county-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(45, 55, 72, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.county-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(45, 55, 72, 0.15);
  border-color: var(--ca-gold);
}

.card-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.county-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.county-card:hover .county-image {
  transform: scale(1.05);
}

.county-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--ca-sunset-gradient);
  color: white;
  padding: 8px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.card-content {
  padding: 24px;
}

.county-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ca-charcoal);
  margin-bottom: 8px;
}

.county-description {
  color: var(--ca-slate);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.county-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ca-gray);
  font-size: 0.875rem;
}

.difficulty-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.difficulty-stars {
  display: flex;
  gap: 2px;
}

.play-button {
  width: 100%;
  background: var(--ca-tech-gradient);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.play-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}
```

## 📊 Progress Indicators & CA Symbols

### California Symbol Progress Bar

```jsx
// Progress Bar with California Icons
<div className="ca-progress-container">
  <div className="progress-header">
    <h4>California Discovery Progress</h4>
    <span className="progress-percentage">{completionPercentage}%</span>
  </div>

  <div className="progress-track">
    <div
      className="progress-fill"
      style={{width: `${completionPercentage}%`}}
    >
      <div className="progress-icons">
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className={`milestone ${milestone.completed ? 'completed' : ''}`}
            style={{left: `${milestone.position}%`}}
          >
            <milestone.Icon className="milestone-icon" />
          </div>
        ))}
      </div>
    </div>
  </div>

  <div className="progress-labels">
    <span>Start</span>
    <span>California Explorer</span>
  </div>
</div>
```

### Progress Indicator Styling

```css
.ca-progress-container {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(45, 55, 72, 0.1);
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-track {
  height: 12px;
  background: var(--ca-fog);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--ca-sunset-gradient);
  border-radius: 6px;
  position: relative;
  transition: width 0.6s ease;
}

.milestone {
  position: absolute;
  top: -8px;
  width: 28px;
  height: 28px;
  background: white;
  border: 3px solid var(--ca-gray);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  transition: all 0.3s ease;
}

.milestone.completed {
  border-color: var(--ca-gold);
  background: var(--ca-gold);
  color: white;
}

.milestone-icon {
  width: 14px;
  height: 14px;
}
```

### Symbol Progression Milestones

```javascript
const californiaProgressMilestones = [
  { position: 0, Icon: PlayIcon, label: "Start Journey", completed: true },
  { position: 20, Icon: PoppyIcon, label: "Poppy Explorer", completed: true },
  { position: 40, Icon: BearIcon, label: "Bear Scout", completed: false },
  { position: 60, Icon: RedwoodIcon, label: "Redwood Ranger", completed: false },
  { position: 80, Icon: MountainIcon, label: "Sierra Climber", completed: false },
  { position: 100, Icon: GoldenGateIcon, label: "Golden State Master", completed: false }
];
```

## 🏆 Achievement Badges & State Icons

### Achievement Badge Design

```jsx
// Achievement Badge Component
<div className="achievement-badge">
  <div className="badge-icon-container">
    <achievement.Icon className="badge-icon" />
    <div className="badge-glow"></div>
  </div>

  <div className="badge-content">
    <h4 className="badge-title">{achievement.title}</h4>
    <p className="badge-description">{achievement.description}</p>
    <div className="badge-rarity">
      <span className="rarity-label">{achievement.rarity}</span>
      <div className="rarity-stars">
        {/* Star rating for rarity */}
      </div>
    </div>
  </div>

  {achievement.earned && (
    <div className="earned-indicator">
      <CheckIcon className="check-icon" />
    </div>
  )}
</div>
```

### Achievement Categories

```javascript
const achievementCategories = {
  geography: {
    icon: MapIcon,
    color: '--ca-ocean',
    achievements: [
      "County Collector", "Border Master", "Capital Conqueror",
      "Coast Cruiser", "Valley Victor", "Desert Discoverer"
    ]
  },

  speed: {
    icon: LightningIcon,
    color: '--ca-sunset',
    achievements: [
      "Lightning Learner", "Speed Demon", "Quick Draw",
      "Flash Finder", "Rapid Ranger", "Sonic Scholar"
    ]
  },

  accuracy: {
    icon: TargetIcon,
    color: '--ca-gold',
    achievements: [
      "Precision Pro", "Perfect Placement", "Bulls-eye Badge",
      "Accuracy Ace", "Sharpshooter", "Master Marksman"
    ]
  },

  exploration: {
    icon: CompassIcon,
    color: '--ca-redwood',
    achievements: [
      "Explorer Extraordinaire", "Adventure Seeker", "Trail Blazer",
      "Wilderness Warrior", "Nature Navigator", "Pathfinder Pro"
    ]
  },

  knowledge: {
    icon: BookIcon,
    color: '--ca-tech',
    achievements: [
      "Fact Finder", "History Buff", "Culture Curator",
      "Knowledge Keeper", "Information Investigator", "Wisdom Warrior"
    ]
  }
};
```

### Badge Styling

```css
.achievement-badge {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(45, 55, 72, 0.1);
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.achievement-badge.earned {
  border-color: var(--ca-gold);
  background: linear-gradient(135deg, #FFFEF7 0%, #FFF8DC 100%);
}

.achievement-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(45, 55, 72, 0.15);
}

.badge-icon-container {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.badge-icon {
  width: 64px;
  height: 64px;
  color: var(--ca-slate);
  transition: all 0.3s ease;
}

.achievement-badge.earned .badge-icon {
  color: var(--ca-gold);
}

.badge-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: var(--ca-sunset-gradient);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.achievement-badge.earned .badge-glow {
  opacity: 0.2;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.1); opacity: 0.3; }
}

.earned-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: var(--ca-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 14px;
  height: 14px;
  color: white;
}
```

## 📱 Responsive Design Layouts

### Desktop Layout (1200px+)

```css
/* Desktop Game Layout */
.game-layout-desktop {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main achievements"
    "footer footer footer";
  height: 100vh;
  gap: 24px;
  padding: 24px;
}

.game-header {
  grid-area: header;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(45, 55, 72, 0.1);
}

.game-sidebar {
  grid-area: sidebar;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(45, 55, 72, 0.1);
  overflow-y: auto;
}

.game-main {
  grid-area: main;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(45, 55, 72, 0.1);
  overflow: hidden;
}

.game-achievements {
  grid-area: achievements;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(45, 55, 72, 0.1);
  overflow-y: auto;
}
```

### Tablet Layout (768px - 1199px)

```css
/* Tablet Game Layout */
.game-layout-tablet {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    "header"
    "sidebar"
    "main"
    "footer";
  height: 100vh;
  gap: 16px;
  padding: 16px;
}

.game-sidebar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.county-cards-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
```

### Mobile Layout (< 768px)

```css
/* Mobile Game Layout */
.game-layout-mobile {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 12px;
  gap: 12px;
}

.game-header {
  padding: 16px;
  border-radius: 12px;
}

.game-main {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  overflow: auto;
}

.county-cards-grid {
  grid-template-columns: 1fr;
  gap: 12px;
}

.county-card {
  border-radius: 12px;
}

.card-content {
  padding: 16px;
}

/* Mobile Map Interactions */
.ca-map-container {
  touch-action: pan-x pan-y;
  overflow: auto;
}

.county-region {
  stroke-width: 2px; /* Thicker strokes for touch */
}

/* Mobile-friendly buttons */
.play-button {
  padding: 16px 24px;
  font-size: 1rem;
}
```

## ♿ Accessibility Features

### High Contrast Mode

```css
/* High Contrast Mode */
@media (prefers-contrast: high) {
  :root {
    --ca-gold: #000000;
    --ca-sunset: #000000;
    --ca-ocean: #000000;
    --ca-redwood: #000000;
    --ca-poppy: #000000;
    --ca-sky: #FFFFFF;
    --ca-desert: #FFFFFF;
    --ca-vineyard: #000000;
    --ca-tech: #000000;
    --ca-fog: #FFFFFF;
    --ca-charcoal: #000000;
    --ca-slate: #000000;
    --ca-gray: #000000;
    --ca-white: #FFFFFF;
    --ca-cream: #FFFFFF;
  }

  .county-region {
    stroke-width: 3px;
  }

  .county-region:hover {
    stroke-width: 4px;
  }

  .achievement-badge,
  .county-card,
  .ca-progress-container {
    border: 2px solid var(--ca-charcoal);
  }
}
```

### Reduced Motion Support

```css
/* Reduced Motion Preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .progress-fill {
    transition: none;
  }

  .county-card:hover {
    transform: none;
  }

  .badge-glow {
    animation: none;
  }
}
```

### Screen Reader Support

```jsx
// Screen Reader Optimized Components
<div
  className="county-region"
  role="button"
  tabIndex="0"
  aria-label={`${countyName} county. ${isCompleted ? 'Completed' : 'Not completed'}. ${difficultyLevel} difficulty.`}
  aria-describedby={`county-${countyId}-description`}
  onKeyDown={handleKeyPress}
>
  <span id={`county-${countyId}-description`} className="sr-only">
    {countyDescription}. Population: {population}. Area: {area} square miles.
  </span>
</div>

<div
  className="achievement-badge"
  role="article"
  aria-label={`Achievement: ${achievementTitle}. ${isEarned ? 'Earned' : 'Not earned yet'}.`}
  aria-describedby={`achievement-${achievementId}-description`}
>
  <span id={`achievement-${achievementId}-description`} className="sr-only">
    {achievementDescription}. Rarity: {achievementRarity}.
  </span>
</div>
```

### Keyboard Navigation

```css
/* Focus States for Keyboard Navigation */
.county-region:focus,
.county-card:focus,
.play-button:focus,
.achievement-badge:focus {
  outline: 3px solid var(--ca-tech);
  outline-offset: 2px;
}

.county-region:focus {
  stroke: var(--ca-tech);
  stroke-width: 4px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--ca-charcoal);
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  transition: top 0.3s ease;
}

.skip-link:focus {
  top: 6px;
}
```

### Screen Reader Only Content

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 🎯 Interactive States & Animations

### Hover States

```css
/* Interactive Hover Effects */
.county-region:hover {
  filter: drop-shadow(0 4px 8px rgba(255, 107, 53, 0.3));
  animation: gentlePulse 1.5s ease-in-out infinite;
}

@keyframes gentlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.county-card:hover .county-image {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.play-button:hover {
  background: linear-gradient(135deg, #5B5FCF 0%, #7C3AED 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}
```

### Loading States

```css
/* Loading Animations */
.loading-skeleton {
  background: linear-gradient(
    90deg,
    var(--ca-fog) 25%,
    var(--ca-sky) 50%,
    var(--ca-fog) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.map-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  background: var(--ca-cream);
  border-radius: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--ca-fog);
  border-top: 4px solid var(--ca-sunset);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## 📦 Component Library Structure

### Component Organization

```
src/components/
├── ui/
│   ├── Button/
│   ├── Card/
│   ├── Badge/
│   ├── ProgressBar/
│   └── Modal/
├── game/
│   ├── Map/
│   ├── CountyCard/
│   ├── GameHeader/
│   ├── Sidebar/
│   └── AchievementPanel/
├── icons/
│   ├── CaliforniaIcons/
│   ├── GameIcons/
│   └── UIIcons/
└── layout/
    ├── GameLayout/
    ├── ResponsiveGrid/
    └── Container/
```

### Design Token System

```javascript
// Design Tokens
export const californiaTokens = {
  colors: {
    primary: {
      50: '#FFFEF7',   // ca-cream
      100: '#FFF8DC',  // light gold
      200: '#FFE55C',  // pale gold
      300: '#FFD700',  // ca-gold
      400: '#E6C200',  // dark gold
      500: '#CC9900',  // deeper gold
    },

    secondary: {
      50: '#F0F8FF',   // very light blue
      100: '#E6F3FF',  // light sky
      200: '#B3D9FF',  // ca-sky
      300: '#87CEEB',  // sky blue
      400: '#0077BE',  // ca-ocean
      500: '#005C8F',  // dark ocean
    },

    accent: {
      50: '#FFF5F0',   // very light orange
      100: '#FFE8D6',  // light peach
      200: '#FFB380',  // light sunset
      300: '#FF6B35',  // ca-sunset
      400: '#E55A2B',  // dark sunset
      500: '#CC4921',  // deeper sunset
    }
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  typography: {
    fontFamily: {
      display: ['California', 'Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },

    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(45, 55, 72, 0.05)',
    md: '0 4px 6px -1px rgba(45, 55, 72, 0.1)',
    lg: '0 10px 15px -3px rgba(45, 55, 72, 0.1)',
    xl: '0 20px 25px -5px rgba(45, 55, 72, 0.1)',
    xxl: '0 25px 50px -12px rgba(45, 55, 72, 0.25)',
  },
};
```

## 🚀 Performance Considerations

### Optimized Asset Loading

```javascript
// Lazy Loading for County Images
const CountyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="county-image-container">
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`county-image ${isLoaded ? 'loaded' : 'loading'}`}
          {...props}
        />
      )}
      {!isLoaded && isInView && (
        <div className="loading-skeleton county-image-skeleton" />
      )}
    </div>
  );
};
```

### CSS Optimization

```css
/* GPU Acceleration for Smooth Animations */
.county-region,
.county-card,
.achievement-badge {
  will-change: transform;
  transform: translateZ(0);
}

/* Optimize Repaints */
.progress-fill {
  will-change: width;
}

.loading-skeleton {
  will-change: background-position;
}

/* Contain Layout Shifts */
.county-card {
  contain: layout style paint;
}

.ca-map-container {
  contain: layout;
}
```

## 📐 Grid Systems & Spacing

### Responsive Grid Utilities

```css
/* California-themed Grid System */
.ca-grid {
  display: grid;
  gap: var(--spacing-md);
}

.ca-grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.ca-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.ca-grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ca-grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Responsive Breakpoints */
@media (min-width: 640px) {
  .ca-grid-sm-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ca-grid-sm-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 768px) {
  .ca-grid-md-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ca-grid-md-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ca-grid-md-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .ca-grid-lg-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ca-grid-lg-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ca-grid-lg-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
```

---

## 🎯 Implementation Notes

1. **Progressive Enhancement**: Start with basic functionality and enhance with advanced features
2. **Performance First**: Optimize for mobile devices and slower connections
3. **Accessibility by Default**: Build with accessibility in mind from the beginning
4. **Modular Design**: Create reusable components for maintainability
5. **California Authenticity**: Ensure all design elements reflect genuine California culture and geography

This design specification provides a comprehensive foundation for building a beautiful, accessible, and authentically California-themed puzzle game interface.