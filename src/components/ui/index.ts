/**
 * California Counties Design System
 * Component Library Index
 *
 * Central export point for all UI components.
 * Import components from this file for consistent usage across the app.
 *
 * @example
 * ```tsx
 * import { Button, Card, Badge } from '@/components/ui';
 * ```
 */

// Button Components
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  SuccessButton,
  type ButtonProps,
} from './Button';

// Badge Components
export { Badge, RegionBadge, StatusBadge, type BadgeProps } from './Badge';

// Card Components
export { Card, CountyCard, type CardProps, type CountyCardProps } from './Card';

// Progress Components
export {
  Progress,
  GameProgress,
  LoadingProgress,
  type ProgressProps,
  type GameProgressProps,
} from './Progress';

// Typography Components
export {
  Heading,
  Text,
  Code,
  Label,
  type HeadingProps,
  type TextProps,
  type CodeProps,
  type LabelProps,
} from './Typography';

// Re-export commonly used types
export type ComponentSize = 'small' | 'medium' | 'large';
export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

// Utility function to combine classNames
export const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};
