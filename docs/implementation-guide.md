# California Theme Implementation Guide

## 🚀 Quick Start

This guide will help you implement the California-themed UI/UX design system in your puzzle game project.

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Build CSS**
```bash
npm run build-css
```

3. **Watch for Changes** (Development)
```bash
npm run watch-css
```

## 📁 Project Structure

```
california_puzzle_game/
├── config/
│   ├── tailwind.config.js     # Tailwind configuration with CA theme
│   └── postcss.config.js      # PostCSS configuration
├── src/
│   ├── components/
│   │   ├── CaliforniaButton.tsx        # Custom button component
│   │   ├── CountyCard.tsx              # County display cards
│   │   ├── ProgressIndicator.tsx       # Progress tracking
│   │   ├── AchievementBadge.tsx        # Achievement system
│   │   └── CaliforniaThemeDemo.tsx     # Demo showcase
│   └── styles/
│       └── globals.css         # Global styles and utilities
├── docs/
│   ├── california-ui-design.md         # Complete design specification
│   └── implementation-guide.md         # This file
└── package.json               # Updated with theme dependencies
```

## 🎨 Design System Usage

### Color Palette

The California theme provides a comprehensive color system:

```css
/* Primary Colors */
--ca-gold: #FFD700        /* California Gold Rush */
--ca-sunset: #FF6B35      /* Pacific Sunset */
--ca-ocean: #0077BE       /* Pacific Ocean Blue */
--ca-redwood: #A0522D     /* Redwood Forest */
--ca-poppy: #FF8C00       /* California Poppy */

/* Supporting Colors */
--ca-sky: #87CEEB         /* California Sky */
--ca-desert: #DEB887      /* Mojave Desert Sand */
--ca-vineyard: #722F37    /* Napa Valley Wine */
--ca-tech: #6366F1        /* Silicon Valley Tech */
--ca-fog: #F5F5F5         /* San Francisco Fog */
```

### Using Tailwind Classes

```tsx
// Background colors
<div className="bg-ca-gold-500">Golden background</div>
<div className="bg-ca-sunset-100">Light sunset background</div>

// Text colors
<h1 className="text-ca-ocean-600">Ocean blue text</h1>
<p className="text-ca-charcoal-700">Dark charcoal text</p>

// Gradients
<div className="bg-ca-sunset">Sunset gradient</div>
<div className="bg-ca-ocean">Ocean gradient</div>

// California-specific utilities
<button className="btn-ca-primary">Primary Button</button>
<div className="card-ca">California-styled card</div>
<div className="glow-ca-gold">Golden glow effect</div>
```

## 🧩 Component Usage

### CaliforniaButton

```tsx
import { CaliforniaButton } from './components/CaliforniaButton';
import { Play, Star } from 'lucide-react';

// Basic usage
<CaliforniaButton variant="primary" size="md">
  Click Me
</CaliforniaButton>

// With icon
<CaliforniaButton variant="secondary" size="lg" icon={Play}>
  Start Game
</CaliforniaButton>

// Loading state
<CaliforniaButton variant="primary" isLoading>
  Processing...
</CaliforniaButton>
```

### CountyCard

```tsx
import { CountyCard } from './components/CountyCard';

const county = {
  id: 'los-angeles',
  name: 'Los Angeles',
  description: 'The entertainment capital of the world.',
  image: '/images/counties/los-angeles.jpg',
  area: 4751,
  population: 10014009,
  difficulty: 2,
  completed: true
};

<CountyCard
  county={county}
  onPlay={(id) => console.log('Playing:', id)}
/>
```

### ProgressIndicator

```tsx
import { ProgressIndicator } from './components/ProgressIndicator';

// Detailed progress
<ProgressIndicator
  completionPercentage={65}
  variant="detailed"
  title="California Discovery Progress"
/>

// Compact progress
<ProgressIndicator
  completionPercentage={85}
  variant="compact"
  showPercentage={true}
/>
```

### AchievementBadge

```tsx
import { AchievementBadge } from './components/AchievementBadge';

const achievement = {
  id: 'first-county',
  title: 'First Steps',
  description: 'Complete your first California county puzzle.',
  category: 'geography',
  rarity: 'common',
  icon: 'star',
  earned: true,
  earnedDate: new Date()
};

<AchievementBadge
  achievement={achievement}
  size="md"
  onClick={(achievement) => console.log('Clicked:', achievement.title)}
/>
```

## 📱 Responsive Design

The theme includes comprehensive responsive utilities:

```tsx
// Responsive grid
<div className="county-cards-grid">
  {/* Cards automatically adjust for mobile/tablet/desktop */}
</div>

// Mobile-first responsive classes
<div className="text-ca-hero"> {/* Automatically responsive */}
  California Counties
</div>

// Custom breakpoints
<div className="hidden tablet:block desktop:hidden">
  Tablet only content
</div>
```

## ♿ Accessibility Features

### High Contrast Mode
Automatically adjusts colors when user prefers high contrast:

```css
@media (prefers-contrast: high) {
  /* Colors automatically adjust to high contrast equivalents */
}
```

### Reduced Motion
Respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are disabled or reduced */
}
```

### Screen Reader Support
Components include proper ARIA labels and screen reader text:

```tsx
<div
  aria-label="Los Angeles county. Completed. Medium difficulty."
  role="button"
  tabIndex="0"
>
  <span className="sr-only">
    County description for screen readers
  </span>
</div>
```

### Keyboard Navigation
All interactive elements support keyboard navigation:

```css
.focus-ca:focus-visible {
  outline: 3px solid var(--ca-tech);
  outline-offset: 2px;
}
```

## 🗺️ Map Integration

For D3.js map styling:

```tsx
// County region styling
<path
  className="map-county-region"
  onMouseEnter={() => setHovered(true)}
  onClick={() => selectCounty(countyId)}
/>

// CSS classes available:
// .map-county-default
// .map-county-hover
// .map-county-selected
// .map-county-completed
```

## 🎯 Performance Optimizations

### CSS Optimization
```css
/* GPU acceleration for smooth animations */
.county-region,
.county-card,
.achievement-badge {
  will-change: transform;
  transform: translateZ(0);
}

/* Contain layout shifts */
.county-card {
  contain: layout style paint;
}
```

### Image Loading
```tsx
// Lazy loading for county images
<img
  src={county.image}
  alt={county.name}
  loading="lazy"
  className="county-image"
/>
```

### Component Optimization
```tsx
// Intersection Observer for performance
import { useInView } from 'react-intersection-observer';

const { ref, inView } = useInView({
  threshold: 0.1,
  triggerOnce: true
});

// Only render when in view
{inView && <CountyCard county={county} />}
```

## 🎨 Customization

### Extending Colors
Add custom colors to `tailwind.config.js`:

```javascript
// In the extend.colors section
customColor: {
  50: '#fff5f5',
  500: '#your-color',
  900: '#darker-shade'
}
```

### Adding Components
Follow the component pattern:

```tsx
// 1. Create TypeScript interface
interface NewComponentProps {
  // Define props
}

// 2. Use forwardRef for accessibility
export const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('base-classes', className)}
        {...props}
      />
    );
  }
);
```

### Custom Animations
Add to `tailwind.config.js`:

```javascript
animation: {
  'custom-animation': 'custom-keyframe 2s ease-in-out infinite',
},
keyframes: {
  'custom-keyframe': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
}
```

## 🚀 Deployment

### Production Build
```bash
# Build optimized CSS
npm run build-css

# Build the project
npm run build
```

### CSS Purging
Tailwind automatically removes unused CSS in production. Ensure your `content` paths in `tailwind.config.js` include all files using Tailwind classes.

## 🛠️ Development Workflow

1. **Start CSS watcher**
   ```bash
   npm run watch-css
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **View component demo**
   Import and use `CaliforniaThemeDemo` component to see all features.

## 📚 Resources

- **Design Specification**: `docs/california-ui-design.md`
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **Accessibility Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

## 🎯 Best Practices

1. **Always use semantic HTML** for accessibility
2. **Test with keyboard navigation** regularly
3. **Verify color contrast** meets WCAG standards
4. **Optimize images** for web (WebP format recommended)
5. **Use loading states** for better user experience
6. **Test on mobile devices** frequently
7. **Respect user preferences** (reduced motion, high contrast)

## 🔧 Troubleshooting

### Common Issues

**CSS not updating**: Ensure the build/watch script is running
```bash
npm run watch-css
```

**Colors not working**: Check that Tailwind is processing your files
- Verify `content` paths in `tailwind.config.js`
- Ensure classes are not being purged

**Components not responsive**: Use mobile-first approach
```tsx
// ✅ Good
<div className="text-sm md:text-base lg:text-lg">

// ❌ Bad
<div className="lg:text-lg md:text-base text-sm">
```

**Accessibility issues**: Always test with screen readers and keyboard navigation

## 📞 Support

For questions or issues with the California theme implementation:

1. Check the design specification: `docs/california-ui-design.md`
2. Review component examples in `CaliforniaThemeDemo.tsx`
3. Verify Tailwind configuration in `config/tailwind.config.js`

---

**Happy coding! 🌟 Build something beautiful for the Golden State!**