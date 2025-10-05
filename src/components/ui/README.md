# California Counties Design System - Component Library

A comprehensive React component library for the California Counties Puzzle Game, built with TypeScript and following modern design system principles.

## 📦 Installation & Setup

All components are located in the `/src/components/ui` directory and can be imported from the main index file.

```tsx
import { Button, Card, Badge, Progress, Heading, Text } from '@/components/ui';
```

## 🎨 Available Components

### Button Component

A flexible button component with multiple variants, sizes, and states.

```tsx
import { Button } from '@/components/ui';

// Basic usage
<Button variant="primary" size="medium" onClick={handleClick}>
  Start Game
</Button>

// With loading state
<Button loading>
  Saving...
</Button>

// With icons
<Button icon={<PlayIcon />} iconRight={<ArrowRight />}>
  Continue
</Button>

// Convenience components
<PrimaryButton>Primary Action</PrimaryButton>
<SecondaryButton>Secondary Action</SecondaryButton>
<DangerButton>Delete</DangerButton>
<SuccessButton>Complete</SuccessButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline'
- `size`: 'small' | 'medium' | 'large'
- `loading`: boolean
- `fullWidth`: boolean
- `icon`: ReactNode (left icon)
- `iconRight`: ReactNode (right icon)

### Badge Component

Display status indicators, labels, and region identifiers.

```tsx
import { Badge, RegionBadge, StatusBadge } from '@/components/ui';

// Basic badge
<Badge variant="success">Complete</Badge>

// Region-specific badge (auto-colors)
<RegionBadge region="bay-area">Bay Area</RegionBadge>

// Status badge
<StatusBadge status="stable" />
<StatusBadge status="beta" />

// With dot indicator
<Badge dot variant="warning">In Progress</Badge>
```

**Props:**
- `variant`: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'region'
- `region`: string (for automatic California region coloring)
- `size`: 'small' | 'medium' | 'large'
- `rounded`: boolean
- `dot`: boolean

### Card Component

Versatile card for displaying county information and content blocks.

```tsx
import { Card, CountyCard } from '@/components/ui';

// Basic card
<Card
  title="San Francisco"
  subtitle="Bay Area"
  description="The cultural and financial center of Northern California."
  region="bay-area"
/>

// County card with metadata
<CountyCard
  name="San Francisco"
  region="bay-area"
  population={873965}
  founded={1850}
  area={47}
  seat="San Francisco"
  selected={isSelected}
  highlighted={isHighlighted}
  onClick={handleCountyClick}
/>

// Custom card with sections
<Card
  variant="elevated"
  header={<CustomHeader />}
  footer={<CardActions />}
>
  <p>Custom content goes here</p>
</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'interactive'
- `region`: string (adds colored accent)
- `metadata`: Array of { label, value } pairs
- `header`, `footer`, `media`: ReactNode

### Progress Component

Display progress bars for game completion and loading states.

```tsx
import { Progress, GameProgress, LoadingProgress } from '@/components/ui';

// Basic progress bar
<Progress value={65} max={100} showLabel />

// Game-specific progress with milestones
<GameProgress
  completedCounties={38}
  totalCounties={58}
  showMilestones
/>

// Animated loading progress
<LoadingProgress label="Loading counties..." />

// Custom styled progress
<Progress
  value={75}
  variant="gradient"
  animated
  striped
  showLabel
/>
```

**Props:**
- `value`: number
- `max`: number (default: 100)
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'gradient'
- `size`: 'small' | 'medium' | 'large'
- `animated`: boolean
- `striped`: boolean
- `showLabel`: boolean

### Typography Components

Consistent text components with semantic HTML.

```tsx
import { Heading, Text, Code, Label } from '@/components/ui';

// Headings with semantic levels
<Heading level={1} size="display">California Counties</Heading>
<Heading level={2} size="section">Game Statistics</Heading>

// Text with various styles
<Text size="lg" weight="medium" color="secondary">
  58 counties to explore
</Text>

// Truncated text
<Text truncate>
  Very long text that will be truncated with ellipsis...
</Text>

// Multi-line clamping
<Text clamp={3}>
  Long paragraph that will be clamped to maximum 3 lines...
</Text>

// Code snippets
<Code inline>getCountyColor()</Code>
<Code language="javascript">
  const region = counties.find(c => c.id === id);
</Code>

// Form labels
<Label htmlFor="county-select" required>
  Select County
</Label>
```

**Typography Props:**
- `size`: Various size options per component
- `color`: 'primary' | 'secondary' | 'tertiary' | 'inverse'
- `align`: 'left' | 'center' | 'right' | 'justify'
- `weight`: 'normal' | 'medium' | 'semibold' | 'bold'
- `truncate`: boolean
- `clamp`: number (1-5)

## 🎯 Usage Examples

### Complete County Card Example

```tsx
import { Card, Badge, Progress, Text } from '@/components/ui';

function CountyInfoCard({ county }) {
  return (
    <Card
      title={county.name}
      region={county.region}
      variant="elevated"
      onClick={() => selectCounty(county.id)}
    >
      <div style={{ marginBottom: '1rem' }}>
        <Text size="sm" color="secondary">
          Founded: {county.founded}
        </Text>
        <Text size="sm" color="secondary">
          Population: {county.population.toLocaleString()}
        </Text>
      </div>

      <Progress
        value={county.discovered ? 100 : 0}
        variant={county.discovered ? 'success' : 'default'}
        showLabel
        label={county.discovered ? 'Discovered' : 'Not discovered'}
      />

      <div style={{ marginTop: '1rem' }}>
        <Badge region={county.region} size="small">
          {county.region}
        </Badge>
      </div>
    </Card>
  );
}
```

### Game Header Example

```tsx
import { Heading, Text, Progress, Button } from '@/components/ui';

function GameHeader({ progress, onReset }) {
  return (
    <header>
      <Heading level={1} size="title">
        California Counties Puzzle
      </Heading>

      <Text size="lg" color="secondary">
        Discover all 58 counties
      </Text>

      <GameProgress
        completedCounties={progress.completed}
        totalCounties={58}
        showMilestones
      />

      <Button
        variant="ghost"
        size="small"
        onClick={onReset}
      >
        Reset Game
      </Button>
    </header>
  );
}
```

## 🎨 Design Tokens

All components use the design tokens defined in your style guide:

- **Colors**: Region-specific colors automatically mapped
- **Typography**: System font stack with consistent sizing
- **Spacing**: 4px base unit scale
- **Shadows**: Elevation system for depth
- **Transitions**: Smooth animations (150-300ms)

## 📝 TypeScript Support

All components are fully typed with TypeScript. Import types alongside components:

```tsx
import { Button, type ButtonProps } from '@/components/ui';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## 🧪 Testing

Components can be tested using React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## 🔄 Migration Guide

If you're migrating from inline styles to the component library:

**Before:**
```tsx
<button className="btn btn-primary" onClick={handleClick}>
  Start Game
</button>
```

**After:**
```tsx
<Button variant="primary" onClick={handleClick}>
  Start Game
</Button>
```

## 📚 Best Practices

1. **Import from index**: Always import from `@/components/ui` for consistency
2. **Use semantic variants**: Choose variants based on intent (success, danger, etc.)
3. **Accessibility**: All components include proper ARIA attributes
4. **Consistent sizing**: Use the size prop consistently across components
5. **Type safety**: Leverage TypeScript types for props validation

## 🎁 Coming Soon

- **Form Components**: Input, Select, Checkbox, Radio
- **Layout Components**: Container, Grid, Stack
- **Feedback Components**: Toast, Modal, Tooltip
- **Navigation Components**: Tabs, Breadcrumb, Pagination
- **Storybook Integration**: Interactive component playground

---

For more information, see the [Style Guide Documentation](../../../docs/STYLE_GUIDE.html)