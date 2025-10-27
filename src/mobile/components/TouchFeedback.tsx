import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/touchFeedback.css';

interface RippleEffect {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

interface TouchFeedbackProps {
  /**
   * Color of the ripple effect
   * @default 'rgba(99, 102, 241, 0.3)' - Indigo-500 with transparency
   */
  color?: string;

  /**
   * Duration of the ripple animation in milliseconds
   * @default 600
   */
  duration?: number;

  /**
   * Maximum diameter of the ripple in pixels
   * @default 100
   */
  maxSize?: number;

  /**
   * Container element to attach touch listeners to
   * If not provided, attaches to the component's own element
   */
  targetRef?: React.RefObject<HTMLElement>;

  /**
   * Whether touch feedback is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Additional className for the container
   */
  className?: string;

  /**
   * Children elements
   */
  children?: React.ReactNode;
}

/**
 * TouchFeedback - Material Design-style ripple effect for touch interactions
 *
 * Features:
 * - Expanding circle animation on touch/tap
 * - Hardware-accelerated transforms for smooth 60fps animation
 * - Respects prefers-reduced-motion accessibility setting
 * - Configurable color, duration, and size
 * - Supports multiple simultaneous ripples
 *
 * @example
 * ```tsx
 * <TouchFeedback color="rgba(59, 130, 246, 0.4)" duration={800}>
 *   <button>Tap me!</button>
 * </TouchFeedback>
 * ```
 */
export const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  color = 'rgba(99, 102, 241, 0.3)',
  duration = 600,
  maxSize = 100,
  targetRef,
  enabled = true,
  className = '',
  children,
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const target = targetRef?.current || containerRef.current;
    if (!target) return;

    const handleTouch = (event: TouchEvent) => {
      // Get touch position relative to target element
      const rect = target.getBoundingClientRect();
      const touch = event.touches[0];

      if (!touch) return;

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Create new ripple
      const newRipple: RippleEffect = {
        id: `ripple-${Date.now()}-${Math.random()}`,
        x,
        y,
        timestamp: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, duration + 100); // Add small buffer
    };

    // Also handle mouse clicks for desktop testing
    const handleClick = (event: MouseEvent) => {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple: RippleEffect = {
        id: `ripple-${Date.now()}-${Math.random()}`,
        x,
        y,
        timestamp: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, duration + 100);
    };

    target.addEventListener('touchstart', handleTouch, { passive: true });
    target.addEventListener('click', handleClick);

    return () => {
      target.removeEventListener('touchstart', handleTouch);
      target.removeEventListener('click', handleClick);
    };
  }, [enabled, targetRef, duration]);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const effectiveDuration = prefersReducedMotion ? 0 : duration;

  return (
    <div
      ref={containerRef}
      className={`touch-feedback-container ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {children}

      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="touch-feedback-ripple"
            initial={{
              x: ripple.x - maxSize / 2,
              y: ripple.y - maxSize / 2,
              width: 0,
              height: 0,
              opacity: 1,
            }}
            animate={{
              width: maxSize,
              height: maxSize,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: effectiveDuration / 1000,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              backgroundColor: color,
              pointerEvents: 'none',
              // Hardware acceleration
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * useTouchFeedback - Hook for programmatically triggering ripple effects
 *
 * @example
 * ```tsx
 * const triggerRipple = useTouchFeedback(elementRef);
 *
 * const handleAction = () => {
 *   triggerRipple({ x: 50, y: 50 });
 * };
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useTouchFeedback = (
  _elementRef: React.RefObject<HTMLElement>,
  options?: Partial<TouchFeedbackProps>
) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const duration = options?.duration || 600;

  const triggerRipple = (position: { x: number; y: number }) => {
    const newRipple: RippleEffect = {
      id: `ripple-${Date.now()}-${Math.random()}`,
      x: position.x,
      y: position.y,
      timestamp: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, duration + 100);
  };

  return { triggerRipple, ripples };
};

export default TouchFeedback;
