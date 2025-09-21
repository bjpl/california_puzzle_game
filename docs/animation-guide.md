# California Counties Puzzle Game - Animation Guide

## Overview

This guide documents all animations and visual feedback components in the California Counties Puzzle Game. The animation system uses Framer Motion for React components and CSS animations for utility effects.

## 🎯 Animation Philosophy

Our animations follow California's vibrant and dynamic spirit:
- **Smooth and Natural**: Spring physics for organic movement
- **Responsive**: Immediate feedback for user interactions
- **Accessible**: Respects `prefers-reduced-motion` settings
- **Performant**: GPU-accelerated transforms and optimized rendering

## 📁 Animation Components

### 1. PlacementFeedback Component

**File**: `src/components/PlacementFeedback.tsx`

Provides visual feedback when counties are placed on the map.

#### Features:
- ✅ **Correct Placement**: Scale animation with green checkmark
- ❌ **Incorrect Placement**: Shake animation with red X
- ⭐ **Perfect Placement**: Enhanced animation with particle effects
- 🏷️ **County Name Reveal**: Spring-animated tooltip

#### Usage:
```tsx
import PlacementFeedback from './components/PlacementFeedback';

<PlacementFeedback
  isCorrect={true}
  isPerfect={isWithinPerfectRadius}
  countyName="Los Angeles"
  position={{ x: 100, y: 200 }}
  onComplete={() => console.log('Animation complete')}
/>
```

#### Animation Variants:
```tsx
// Correct placement
{
  scale: [1, 1.2, 1],
  opacity: [0, 1, 1, 0],
  transition: { duration: 1, ease: "easeOut" }
}

// Incorrect placement (shake)
{
  x: [-10, 10, -10, 10, 0],
  transition: { duration: 0.5, ease: "easeInOut" }
}

// Perfect placement
{
  scale: [1, 1.3, 1.1],
  rotate: [0, 5, -5, 0],
  transition: { duration: 0.8, ease: "easeOut" }
}
```

### 2. Page Transitions

**File**: `src/components/PageTransition.tsx`

Smooth transitions between different game modes and screens.

#### Animation Modes:

##### Slide Transition
```tsx
<PageTransition mode="slide" direction="right">
  <GameScreen />
</PageTransition>
```

##### Fade Transition
```tsx
<PageTransition mode="fade" duration={0.5}>
  <MenuScreen />
</PageTransition>
```

##### California Special
```tsx
<PageTransition mode="california">
  <WelcomeScreen />
</PageTransition>
```

#### Usage with Routes:
```tsx
import { RouteTransition } from './components/PageTransition';

<RouteTransition location={currentRoute} mode="slide">
  {currentComponent}
</RouteTransition>
```

### 3. Study Mode Card Flips

**File**: `src/components/StudyModeCard.tsx`

Interactive card component with 3D flip animations for learning county information.

#### Features:
- 🔄 **3D Flip Animation**: Perspective-based rotation
- 🤖 **Auto-flip Mode**: Automatic rotation with configurable timing
- 🎨 **Dynamic Content**: Different layouts for front/back
- 🌊 **Spring Physics**: Natural movement with customizable damping

#### Usage:
```tsx
<StudyModeCard
  county={{
    name: "San Francisco",
    population: 881549,
    facts: ["Famous for Golden Gate Bridge", "Tech hub"]
  }}
  autoFlip={true}
  flipDelay={3000}
  onFlip={() => console.log('Card flipped')}
/>
```

#### Card Variants:
```tsx
{
  front: {
    rotateY: 0,
    transition: { type: 'spring', damping: 15, stiffness: 100 }
  },
  back: {
    rotateY: 180,
    transition: { type: 'spring', damping: 15, stiffness: 100 }
  }
}
```

### 4. County List with Stagger

**File**: `src/components/CountyList.tsx`

Animated list of counties with staggered entrance animations.

#### Features:
- 📋 **Stagger Animation**: Sequential reveal of list items
- 🔍 **Search Integration**: Smooth filtering animations
- 📊 **Progress Visualization**: Animated progress bar
- 🏷️ **Status Indicators**: Animated badges for completion state

#### Stagger Configuration:
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', damping: 15, stiffness: 200 }
  }
};
```

### 5. Drag & Drop Physics

**File**: `src/components/DragDropPhysics.tsx`

Advanced drag and drop with spring physics and magnetic effects.

#### Features:
- 🧲 **Magnetic Targets**: Snap-to zones with attraction force
- 🔧 **Spring Physics**: Configurable damping and stiffness
- 📐 **Grid Snapping**: Optional alignment to grid
- 🎯 **Visual Feedback**: Dynamic shadows and effects
- ⚡ **Elastic Boundaries**: Bounce effects at constraints

#### Usage:
```tsx
<DragDropPhysics
  magneticTargets={[
    { x: 100, y: 100, radius: 50 }
  ]}
  elasticity={0.8}
  damping={15}
  stiffness={300}
  snapToGrid={true}
  gridSize={20}
  onDrop={(position) => handleDrop(position)}
>
  <CountyPiece />
</DragDropPhysics>
```

#### Physics Configuration:
```tsx
// Spring configuration
const springX = useSpring(x, { damping: 15, stiffness: 300 });
const springY = useSpring(y, { damping: 15, stiffness: 300 });

// Magnetic attraction
const magnetStrength = 1 - (distance / target.radius);
const magnetX = (target.x - currentX) * magnetStrength * 0.3;
```

### 6. Hover Effects System

**File**: `src/components/HoverEffects.tsx`

Comprehensive hover effect system with multiple interaction patterns.

#### Effect Types:

##### Lift Effect
```tsx
<HoverEffects effect="lift" intensity="medium">
  <Button>Hover me</Button>
</HoverEffects>
```

##### Glow Effect
```tsx
<HoverEffects effect="glow" intensity="strong">
  <CountyShape />
</HoverEffects>
```

##### California Special
```tsx
<HoverEffects effect="california">
  <CaliforniaLogo />
</HoverEffects>
```

#### Specialized Components:
```tsx
// County-specific hover
<CountyHover isActive={true} isCorrect={false}>
  <CountyPolygon />
</CountyHover>

// Button hover with variants
<ButtonHover variant="california">
  <ActionButton />
</ButtonHover>

// Tooltip integration
<TooltipHover tooltip="San Francisco County" position="top">
  <CountyElement />
</TooltipHover>
```

## 🎨 CSS Animation Classes

**File**: `src/styles/animations.css`

### Utility Classes

#### Pulse Effects
```css
.pulse /* Standard pulse animation */
.pulse-glow /* Pulse with glow effect */
.hint-pulse /* Special hint highlighting */
```

#### Glow Effects
```css
.glow /* Basic glow animation */
.glow-green /* Success state glow */
.glow-blue /* Active state glow */
.glow-gold /* Achievement glow */
.rainbow-glow /* Multi-color cycling glow */
```

#### Loading States
```css
.spinner /* Basic rotation spinner */
.spinner-pulse /* Pulsing spinner */
.ca-spinner /* California-themed spinner */
.loading-dots /* Animated dots (...) */
```

#### Hover States
```css
.hover-lift /* Vertical lift on hover */
.hover-scale /* Scale transformation */
.hover-glow /* Glow effect on hover */
.county-hover /* County-specific hover */
.btn-hover /* Button hover with shine effect */
```

### Animation Examples

#### Success Confetti
```css
.success-confetti {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.confetti {
  position: fixed;
  width: 10px; height: 10px;
  animation: confetti-fall 3s linear infinite;
}
```

#### Shake Animation
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
```

## 🎮 Game-Specific Animations

### County Placement Flow

1. **Pick up county**: Scale down with shadow
2. **Drag over map**: Magnetic attraction near targets
3. **Correct placement**: Scale up + green glow + name reveal
4. **Incorrect placement**: Shake + red flash + return to tray

### Game Mode Transitions

1. **Menu → Game**: Slide right with California effect
2. **Game → Study**: Fade with card flip preparation
3. **Study → Menu**: Scale down with blur

### Achievement Celebrations

1. **County completed**: Confetti burst + scale animation
2. **Region completed**: Rainbow glow + floating effect
3. **Game completed**: Full-screen celebration with particles

## ⚡ Performance Optimizations

### GPU Acceleration
All animations use transform properties for GPU acceleration:
```css
transform: translateX() translateY() scale() rotate();
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Cleanup
```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    // Clean up animation state
  }, animationDuration);

  return () => clearTimeout(timer);
}, []);
```

## 🎯 Best Practices

### 1. Timing Guidelines
- **Micro-interactions**: 100-200ms
- **Component transitions**: 300-500ms
- **Page transitions**: 500-800ms
- **Celebration animations**: 1-3 seconds

### 2. Easing Functions
```tsx
// Natural movement
ease: "easeOut"

// Bouncy interactions
type: "spring", damping: 15, stiffness: 300

// Smooth UI transitions
ease: [0.4, 0, 0.2, 1] // cubic-bezier
```

### 3. Animation States
```tsx
// Clear state management
const [animationState, setAnimationState] = useState<
  'idle' | 'animating' | 'complete'
>('idle');
```

### 4. Performance Monitoring
```tsx
// Frame rate monitoring
const controls = useAnimation();
const [fps, setFps] = useState(60);

useEffect(() => {
  // Monitor animation performance
}, []);
```

## 🔧 Customization

### Theme Integration
```tsx
// Use CSS variables for consistent theming
style={{
  '--primary-color': 'rgb(239, 68, 68)', // California red
  '--secondary-color': 'rgb(251, 191, 36)', // California gold
  '--accent-color': 'rgb(59, 130, 246)' // Pacific blue
}}
```

### Dynamic Configuration
```tsx
interface AnimationConfig {
  speed: number;
  intensity: 'subtle' | 'medium' | 'strong';
  effects: string[];
  accessibility: boolean;
}
```

### Custom Variants
```tsx
const customVariants = {
  californiaEntrance: {
    initial: { scale: 0.3, rotateZ: -180, filter: 'hue-rotate(180deg)' },
    animate: { scale: 1, rotateZ: 0, filter: 'hue-rotate(0deg)' }
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Animation not playing**
   - Check `prefers-reduced-motion` setting
   - Verify component is mounted
   - Ensure trigger conditions are met

2. **Performance issues**
   - Use `transform` instead of position changes
   - Limit number of simultaneous animations
   - Implement animation queuing

3. **Layout shifts**
   - Use `transform` for movement
   - Set explicit dimensions
   - Use `will-change` property sparingly

### Debug Tools
```tsx
// Animation debugging
const debugAnimation = useAnimation();

useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Animation state:', animationState);
  }
}, [animationState]);
```

## 📚 Additional Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [CSS Animation Performance](https://web.dev/animations/)
- [Spring Physics](https://www.react-spring.dev/concepts)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)

---

*This animation system makes the California Counties Puzzle Game engaging and delightful while maintaining excellent performance and accessibility standards.*