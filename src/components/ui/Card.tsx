import React from 'react';
import { Badge } from './Badge';
import './Card.css';

// CONCEPT: Flexible card component for county information
export interface CardProps {
  /** Card title */
  title?: string;

  /** Card subtitle */
  subtitle?: string;

  /** Card description */
  description?: string;

  /** Region name for color accent */
  region?: string;

  /** Visual variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';

  /** Card header content */
  header?: React.ReactNode;

  /** Card footer content */
  footer?: React.ReactNode;

  /** Card media (image/map) */
  media?: React.ReactNode;

  /** Additional metadata items */
  metadata?: Array<{ label: string; value: string | number }>;

  /** Click handler */
  onClick?: () => void;

  /** Custom className */
  className?: string;

  /** Children content */
  children?: React.ReactNode;
}

/**
 * Card Component
 *
 * A versatile card component for displaying county information,
 * statistics, and other content blocks.
 *
 * @example
 * ```tsx
 * <Card
 *   title="San Francisco"
 *   subtitle="Bay Area"
 *   region="bay-area"
 *   metadata={[
 *     { label: "Population", value: "873,965" },
 *     { label: "Founded", value: 1850 }
 *   ]}
 * />
 * ```
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  description,
  region,
  variant = 'default',
  header,
  footer,
  media,
  metadata,
  onClick,
  className = '',
  children,
}) => {
  const cardClasses = [
    'ca-card',
    `ca-card--${variant}`,
    region && `ca-card--region-${region.toLowerCase().replace(/\s+/g, '-')}`,
    onClick && 'ca-card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Component = onClick ? 'article' : 'div';

  return (
    <Component
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {media && <div className="ca-card__media">{media}</div>}

      {header || title || subtitle ? (
        <div className="ca-card__header">
          {header || (
            <>
              <div className="ca-card__header-content">
                {title && <h3 className="ca-card__title">{title}</h3>}
                {subtitle && <p className="ca-card__subtitle">{subtitle}</p>}
              </div>
              {region && (
                <Badge region={region} size="small">
                  {region.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              )}
            </>
          )}
        </div>
      ) : null}

      {(description || children || metadata) && (
        <div className="ca-card__body">
          {description && <p className="ca-card__description">{description}</p>}
          {children}

          {metadata && metadata.length > 0 && (
            <dl className="ca-card__metadata">
              {metadata.map((item, index) => (
                <div key={index} className="ca-card__metadata-item">
                  <dt className="ca-card__metadata-label">{item.label}</dt>
                  <dd className="ca-card__metadata-value">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {footer && <div className="ca-card__footer">{footer}</div>}
    </Component>
  );
};

// County-specific card component
export interface CountyCardProps {
  name: string;
  region: string;
  population?: number;
  founded?: number;
  area?: number;
  seat?: string;
  onClick?: () => void;
  selected?: boolean;
  highlighted?: boolean;
}

/**
 * CountyCard Component
 *
 * Specialized card for displaying county information with
 * standardized layout and region coloring.
 */
export const CountyCard: React.FC<CountyCardProps> = ({
  name,
  region,
  population,
  founded,
  area,
  seat,
  onClick,
  selected,
  highlighted,
}) => {
  const metadata = [];

  if (population) {
    metadata.push({
      label: 'Population',
      value: population.toLocaleString(),
    });
  }

  if (founded) {
    metadata.push({
      label: 'Founded',
      value: founded,
    });
  }

  if (area) {
    metadata.push({
      label: 'Area',
      value: `${area.toLocaleString()} sq mi`,
    });
  }

  if (seat) {
    metadata.push({
      label: 'County Seat',
      value: seat,
    });
  }

  return (
    <Card
      title={name}
      region={region}
      variant={selected ? 'elevated' : highlighted ? 'interactive' : 'default'}
      metadata={metadata}
      onClick={onClick}
      className={[
        'ca-county-card',
        selected && 'ca-county-card--selected',
        highlighted && 'ca-county-card--highlighted',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
};
