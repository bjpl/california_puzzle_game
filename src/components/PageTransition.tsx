import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'slide' | 'fade' | 'scale' | 'rotate' | 'california';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = 'slide',
  direction = 'right',
  duration = 0.5,
  className = ''
}) => {
  const getVariants = () => {
    switch (mode) {
      case 'slide':
        return {
          initial: {
            x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
            y: direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0,
            opacity: 0
          },
          animate: {
            x: 0,
            y: 0,
            opacity: 1,
            transition: {
              type: 'spring',
              damping: 25,
              stiffness: 120,
              duration
            }
          },
          exit: {
            x: direction === 'left' ? '100%' : direction === 'right' ? '-100%' : 0,
            y: direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0,
            opacity: 0,
            transition: {
              duration: duration * 0.7
            }
          }
        };

      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: {
              duration,
              ease: 'easeOut'
            }
          },
          exit: {
            opacity: 0,
            transition: {
              duration: duration * 0.7
            }
          }
        };

      case 'scale':
        return {
          initial: {
            scale: 0.8,
            opacity: 0,
            filter: 'blur(10px)'
          },
          animate: {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
              type: 'spring',
              damping: 20,
              stiffness: 100,
              duration
            }
          },
          exit: {
            scale: 1.1,
            opacity: 0,
            filter: 'blur(10px)',
            transition: {
              duration: duration * 0.7
            }
          }
        };

      case 'rotate':
        return {
          initial: {
            rotateY: -90,
            opacity: 0,
            transformPerspective: 1000
          },
          animate: {
            rotateY: 0,
            opacity: 1,
            transition: {
              type: 'spring',
              damping: 15,
              stiffness: 100,
              duration
            }
          },
          exit: {
            rotateY: 90,
            opacity: 0,
            transition: {
              duration: duration * 0.7
            }
          }
        };

      case 'california':
        // Custom California-themed entrance
        return {
          initial: {
            scale: 0.3,
            rotateZ: -180,
            opacity: 0,
            filter: 'hue-rotate(180deg) brightness(0.3)'
          },
          animate: {
            scale: 1,
            rotateZ: 0,
            opacity: 1,
            filter: 'hue-rotate(0deg) brightness(1)',
            transition: {
              type: 'spring',
              damping: 15,
              stiffness: 80,
              duration: duration * 1.2,
              delay: 0.1
            }
          },
          exit: {
            scale: 0.3,
            rotateZ: 180,
            opacity: 0,
            filter: 'hue-rotate(180deg) brightness(0.3)',
            transition: {
              duration: duration * 0.8
            }
          }
        };

      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  return (
    <motion.div
      className={className}
      variants={getVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      {children}
    </motion.div>
  );
};

// Higher order component for wrapping pages
export const withPageTransition = (
  Component: React.ComponentType<any>,
  transitionProps?: Partial<PageTransitionProps>
) => {
  return (props: any) => (
    <PageTransition {...transitionProps}>
      <Component {...props} />
    </PageTransition>
  );
};

// Route transition wrapper
interface RouteTransitionProps {
  children: React.ReactNode;
  location?: string;
  mode?: PageTransitionProps['mode'];
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  location,
  mode = 'slide'
}) => (
  <AnimatePresence mode="wait">
    <PageTransition key={location} mode={mode}>
      {children}
    </PageTransition>
  </AnimatePresence>
);

export default PageTransition;