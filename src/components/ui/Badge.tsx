import React from 'react';
import './Badge.css';

// CONCEPT: Region-aware badge component
export interface BadgeProps {
  /** Content to display in the badge */
  children: React.ReactNode;

  /** Visual variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'region';

  /** Region name for automatic color mapping */
  region?: string;

  /** Size variant */
  size?: 'small' | 'medium' | 'large';

  /** Rounded style */
  rounded?: boolean;

  /** Show dot indicator */
  dot?: boolean;

  /** Custom className */
  className?: string;

  /** Click handler */
  onClick?: () => void;
}

/**
 * Badge Component
 *
 * Displays status indicators, labels, and region identifiers.
 * Automatically maps California regions to their designated colors.
 *
 * @example
 * ```tsx
 * <Badge variant="success">Complete</Badge>
 * <Badge region="bay-area">Bay Area</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  region,
  size = 'medium',
  rounded = true,
  dot = false,
  className = '',
  onClick,
}) => {
  // PATTERN: Map region names to color classes
  const getRegionClass = (regionName: string): string => {
    // Normalize: lowercase, replace spaces AND underscores with hyphens
    const normalized = regionName.toLowerCase().replace(/[\s_]+/g, '-');

    const regionMap: Record<string, string> = {
      'bay-area': 'bay-area',
      'central-valley': 'central-valley',
      'central-coast': 'central-valley', // Map to similar color
      'gold-country': 'gold-country',
      'los-angeles': 'los-angeles',
      'north-coast': 'north-coast',
      northern: 'northern',
      'northern-california': 'northern',
      'orange-county': 'orange-county',
      sacramento: 'sacramento',
      'san-diego': 'san-diego',
      sierra: 'sierra',
      'sierra-nevada': 'sierra',
      southern: 'southern-california',
      'southern-california': 'southern-california',
    };

    return regionMap[normalized] || 'default';
  };

  const badgeClasses = [
    'ca-badge',
    region ? `ca-badge--region-${getRegionClass(region)}` : `ca-badge--${variant}`,
    `ca-badge--${size}`,
    rounded && 'ca-badge--rounded',
    onClick && 'ca-badge--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Component = onClick ? 'button' : 'span';

  return (
    <Component className={badgeClasses} onClick={onClick} type={onClick ? 'button' : undefined}>
      {dot && <span className="ca-badge__dot" />}
      {children}
    </Component>
  );
};

// Region-specific badge components for convenience
export const RegionBadge: React.FC<Omit<BadgeProps, 'variant'> & { region: string }> = (props) => (
  <Badge variant="region" {...props} />
);

// Status badge components
export const StatusBadge: React.FC<
  BadgeProps & { status: 'stable' | 'beta' | 'new' | 'deprecated' }
> = ({ status, ...props }) => {
  const statusMap = {
    stable: { variant: 'success' as const, text: 'Stable' },
    beta: { variant: 'warning' as const, text: 'Beta' },
    new: { variant: 'info' as const, text: 'New' },
    deprecated: { variant: 'default' as const, text: 'Deprecated' },
  };

  const config = statusMap[status];

  return (
    <Badge variant={config.variant} size="small" {...props}>
      {props.children || config.text}
    </Badge>
  );
};
