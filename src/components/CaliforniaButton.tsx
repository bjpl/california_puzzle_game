import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';
import { playSound, SoundType } from '../utils/soundManager';

interface CaliforniaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  enableSounds?: boolean;
  children: React.ReactNode;
}

export const CaliforniaButton = forwardRef<HTMLButtonElement, CaliforniaButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    isLoading = false,
    enableSounds = true,
    disabled,
    children,
    onClick,
    onMouseEnter,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantClasses = {
      primary: 'bg-ca-tech text-white hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-ca-tech-500',
      secondary: 'bg-ca-sunset text-white hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-ca-sunset-500',
      outline: 'border-2 border-ca-ocean-500 text-ca-ocean-600 bg-transparent hover:bg-ca-ocean-500 hover:text-white focus-visible:ring-ca-ocean-500',
      ghost: 'text-ca-slate-600 bg-transparent hover:bg-ca-fog-100 hover:text-ca-charcoal-700 focus-visible:ring-ca-tech-500'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-base rounded-xl gap-2',
      lg: 'px-6 py-3 text-lg rounded-xl gap-2.5',
      xl: 'px-8 py-4 text-xl rounded-2xl gap-3'
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7'
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (enableSounds && !disabled && !isLoading) {
        playSound(SoundType.CLICK);
      }
      onClick?.(event);
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (enableSounds && !disabled && !isLoading) {
        playSound(SoundType.HOVER);
      }
      onMouseEnter?.(event);
    };

    return (
      <button
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {isLoading ? (
          <div className={clsx('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizeClasses[size])} />
        ) : (
          <>
            {Icon && iconPosition === 'left' && (
              <Icon className={iconSizeClasses[size]} />
            )}
            {children}
            {Icon && iconPosition === 'right' && (
              <Icon className={iconSizeClasses[size]} />
            )}
          </>
        )}
      </button>
    );
  }
);

CaliforniaButton.displayName = 'CaliforniaButton';