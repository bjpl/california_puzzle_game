/**
 * UserMenu Component - Dropdown Auth Menu
 *
 * Purpose: Display user authentication status and provide sign-in/sign-out controls
 * Features: Anonymous user badge, dropdown menu, user ID display, framer-motion animations
 *
 * Usage:
 *   <UserMenu />
 *
 * Last updated: 2025-12-30
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, UserCircle, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import './UserMenu.css';
import { AuthModal } from './AuthModal';

/**
 * UserMenu Component
 *
 * CONCEPT: Dropdown menu for authentication controls
 * WHY: Provide easy access to auth state and actions
 * PATTERN: Dropdown with click-outside handling and animations
 *
 * @example
 * ```tsx
 * <UserMenu />
 * ```
 */
export const UserMenu: React.FC = () => {
  const { user, isAuthenticated, isAnonymous, signOut, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  /**
   * Truncate user ID for display
   *
   * CONCEPT: Show first 8 characters of UUID
   * WHY: UUIDs are too long for UI display
   * PATTERN: String slicing with ellipsis
   */
  const truncateUserId = (id: string): string => {
    return `${id.slice(0, 8)}...`;
  };

  /**
   * Handle sign-in click
   */
  const handleSignIn = () => {
    setIsOpen(false);
    setShowAuthModal(true);
  };

  /**
   * Handle sign-out click
   */
  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  /**
   * Get display name for authenticated user
   */
  const getUserDisplayName = (): string => {
    if (!user) return '';
    if (isAnonymous) return truncateUserId(user.id);
    const metadata = user.user_metadata;
    if (metadata?.display_name) return metadata.display_name;
    if (metadata?.full_name) return metadata.full_name;
    if (metadata?.name) return metadata.name;
    if (user.email) return user.email.split('@')[0];
    return truncateUserId(user.id);
  };

  // Show sign-in button if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <button
          className="ca-user-menu__sign-in"
          onClick={handleSignIn}
          disabled={isLoading}
          aria-label="Sign in"
        >
          <UserCircle size={20} />
          <span>Sign In</span>
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="ca-user-menu" ref={menuRef}>
      {/* Trigger Button */}
      <button
        className="ca-user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="ca-user-menu__avatar">
          <User size={20} />
        </div>

        <div className="ca-user-menu__info">
          <span className="ca-user-menu__id">{getUserDisplayName()}</span>
          {isAnonymous && (
            <Badge variant="warning" size="small" className="ca-user-menu__badge">
              Anonymous
            </Badge>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`ca-user-menu__chevron ${isOpen ? 'ca-user-menu__chevron--open' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ca-user-menu__dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {/* User Info Section */}
            <div className="ca-user-menu__section">
              <div className="ca-user-menu__user-info">
                <div className="ca-user-menu__user-icon">
                  <User size={24} />
                </div>
                <div className="ca-user-menu__user-details">
                  <span className="ca-user-menu__user-id" title={user!.id}>
                    {getUserDisplayName()}
                  </span>
                  {isAnonymous && (
                    <Badge variant="warning" size="small">
                      Anonymous User
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="ca-user-menu__divider" />

            {/* Actions Section */}
            <div className="ca-user-menu__section">
              {isAnonymous && (
                <button
                  className="ca-user-menu__item ca-user-menu__item--upgrade"
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  <Mail size={16} />
                  <span>Create Account</span>
                </button>
              )}
              <button className="ca-user-menu__item" onClick={handleSignOut} disabled={isLoading}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
