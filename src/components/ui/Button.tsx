import React from 'react';
import './Button.css';

// CONCEPT: Comprehensive type safety for all button variants
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';

  /** Size preset */
  size?: 'small' | 'medium' | 'large';

  /** Loading state */
  loading?: boolean;

  /** Icon to display (left side) */
  icon?: React.ReactNode;

  /** Icon to display (right side) */
  iconRight?: React.ReactNode;

  /** Full width button */
  fullWidth?: boolean;

  /** Custom CSS classes */
  className?: string;

  /** Children elements */
  children: React.ReactNode;
}

/**
 * Button Component
 *
 * A flexible button component that supports multiple variants, sizes, and states.
 * Follows the California Counties Design System specifications.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="medium" onClick={handleClick}>
 *   Start Game
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  disabled = false,
  children,
  ...props
}) => {
  // PATTERN: Compose className from props for flexibility
  const buttonClasses = [
    'ca-button',
    `ca-button--${variant}`,
    `ca-button--${size}`,
    fullWidth && 'ca-button--full-width',
    loading && 'ca-button--loading',
    disabled && 'ca-button--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClasses} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading ? (
        <span className="ca-button__loader" aria-label="Loading...">
          <svg className="ca-button__spinner" viewBox="0 0 24 24">
            <circle
              className="ca-button__spinner-path"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="3"
            />
          </svg>
        </span>
      ) : (
        <>
          {icon && <span className="ca-button__icon ca-button__icon--left">{icon}</span>}
          <span className="ca-button__content">{children}</span>
          {iconRight && <span className="ca-button__icon ca-button__icon--right">{iconRight}</span>}
        </>
      )}
    </button>
  );
};

// Export convenience components for common variants
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props} />
);
