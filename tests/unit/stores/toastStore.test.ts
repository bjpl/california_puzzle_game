/**
 * Toast Store Tests
 * Tests notification state management with auto-dismiss and queue limiting
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useToastStore, TOAST_DURATIONS } from '../../../src/stores/toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have empty toasts array initially', () => {
      const state = useToastStore.getState();
      expect(state.toasts).toEqual([]);
    });
  });

  describe('addToast', () => {
    it('should add toast to queue', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Test message',
        duration: 3000,
        dismissible: true,
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('Test message');
      expect(state.toasts[0].type).toBe('success');
    });

    it('should generate unique id for each toast', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Toast 1',
        duration: 3000,
        dismissible: true,
      });

      useToastStore.getState().addToast({
        type: 'error',
        message: 'Toast 2',
        duration: 3000,
        dismissible: true,
      });

      const state = useToastStore.getState();
      expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
    });

    it('should limit queue to 3 toasts', () => {
      for (let i = 0; i < 5; i++) {
        useToastStore.getState().addToast({
          type: 'info',
          message: `Toast ${i}`,
          duration: Infinity,
          dismissible: true,
        });
      }

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(3);
      // Should have toasts 2, 3, 4 (oldest removed)
      expect(state.toasts[0].message).toBe('Toast 2');
      expect(state.toasts[1].message).toBe('Toast 3');
      expect(state.toasts[2].message).toBe('Toast 4');
    });

    it('should auto-dismiss toast after duration', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Auto dismiss',
        duration: 3000,
        dismissible: true,
      });

      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(3000);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should not auto-dismiss toast with Infinity duration', () => {
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Persistent',
        duration: Infinity,
        dismissible: true,
      });

      vi.advanceTimersByTime(10000);

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('should not auto-dismiss toast with 0 duration', () => {
      useToastStore.getState().addToast({
        type: 'warning',
        message: 'Zero duration',
        duration: 0,
        dismissible: true,
      });

      vi.advanceTimersByTime(10000);

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('should preserve toast properties', () => {
      useToastStore.getState().addToast({
        type: 'warning',
        message: 'Warning message',
        duration: 4000,
        dismissible: false,
      });

      const toast = useToastStore.getState().toasts[0];
      expect(toast.type).toBe('warning');
      expect(toast.message).toBe('Warning message');
      expect(toast.duration).toBe(4000);
      expect(toast.dismissible).toBe(false);
    });
  });

  describe('removeToast', () => {
    it('should remove toast by id', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'To be removed',
        duration: Infinity,
        dismissible: true,
      });

      const toastId = useToastStore.getState().toasts[0].id;
      useToastStore.getState().removeToast(toastId);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should only remove specified toast', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Toast 1',
        duration: Infinity,
        dismissible: true,
      });
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Toast 2',
        duration: Infinity,
        dismissible: true,
      });

      const toastId = useToastStore.getState().toasts[0].id;
      useToastStore.getState().removeToast(toastId);

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('Toast 2');
    });

    it('should handle removing non-existent toast gracefully', () => {
      useToastStore.getState().addToast({
        type: 'info',
        message: 'Existing',
        duration: Infinity,
        dismissible: true,
      });

      useToastStore.getState().removeToast('non-existent-id');

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all toasts', () => {
      for (let i = 0; i < 3; i++) {
        useToastStore.getState().addToast({
          type: 'info',
          message: `Toast ${i}`,
          duration: Infinity,
          dismissible: true,
        });
      }

      useToastStore.getState().clearAll();

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('should work on empty queue', () => {
      useToastStore.getState().clearAll();

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('TOAST_DURATIONS', () => {
    it('should have correct duration for success', () => {
      expect(TOAST_DURATIONS.success).toBe(3000);
    });

    it('should have correct duration for error', () => {
      expect(TOAST_DURATIONS.error).toBe(5000);
    });

    it('should have correct duration for info', () => {
      expect(TOAST_DURATIONS.info).toBe(3000);
    });

    it('should have correct duration for warning', () => {
      expect(TOAST_DURATIONS.warning).toBe(4000);
    });
  });

  describe('Toast Types', () => {
    it('should handle success type', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Success!',
        duration: TOAST_DURATIONS.success,
        dismissible: true,
      });

      expect(useToastStore.getState().toasts[0].type).toBe('success');
    });

    it('should handle error type', () => {
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Error!',
        duration: TOAST_DURATIONS.error,
        dismissible: true,
      });

      expect(useToastStore.getState().toasts[0].type).toBe('error');
    });

    it('should handle info type', () => {
      useToastStore.getState().addToast({
        type: 'info',
        message: 'Info!',
        duration: TOAST_DURATIONS.info,
        dismissible: true,
      });

      expect(useToastStore.getState().toasts[0].type).toBe('info');
    });

    it('should handle warning type', () => {
      useToastStore.getState().addToast({
        type: 'warning',
        message: 'Warning!',
        duration: TOAST_DURATIONS.warning,
        dismissible: true,
      });

      expect(useToastStore.getState().toasts[0].type).toBe('warning');
    });
  });

  describe('Queue Behavior (FIFO)', () => {
    it('should remove oldest toast when at capacity', () => {
      // Add 3 toasts
      for (let i = 1; i <= 3; i++) {
        useToastStore.getState().addToast({
          type: 'info',
          message: `Toast ${i}`,
          duration: Infinity,
          dismissible: true,
        });
      }

      // Add 4th toast
      useToastStore.getState().addToast({
        type: 'info',
        message: 'Toast 4',
        duration: Infinity,
        dismissible: true,
      });

      const messages = useToastStore.getState().toasts.map((t) => t.message);
      expect(messages).toEqual(['Toast 2', 'Toast 3', 'Toast 4']);
    });

    it('should maintain order in queue', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'First',
        duration: Infinity,
        dismissible: true,
      });
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Second',
        duration: Infinity,
        dismissible: true,
      });
      useToastStore.getState().addToast({
        type: 'warning',
        message: 'Third',
        duration: Infinity,
        dismissible: true,
      });

      const messages = useToastStore.getState().toasts.map((t) => t.message);
      expect(messages).toEqual(['First', 'Second', 'Third']);
    });
  });

  describe('Concurrent Auto-Dismiss', () => {
    it('should handle multiple auto-dismiss timers', () => {
      useToastStore.getState().addToast({
        type: 'success',
        message: 'Quick',
        duration: 1000,
        dismissible: true,
      });
      useToastStore.getState().addToast({
        type: 'error',
        message: 'Slow',
        duration: 3000,
        dismissible: true,
      });

      expect(useToastStore.getState().toasts).toHaveLength(2);

      vi.advanceTimersByTime(1000);
      expect(useToastStore.getState().toasts).toHaveLength(1);
      expect(useToastStore.getState().toasts[0].message).toBe('Slow');

      vi.advanceTimersByTime(2000);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid additions', () => {
      for (let i = 0; i < 100; i++) {
        useToastStore.getState().addToast({
          type: 'info',
          message: `Toast ${i}`,
          duration: Infinity,
          dismissible: true,
        });
      }

      // Should only have 3 (last 3)
      expect(useToastStore.getState().toasts).toHaveLength(3);
      expect(useToastStore.getState().toasts[2].message).toBe('Toast 99');
    });

    it('should handle empty message', () => {
      useToastStore.getState().addToast({
        type: 'info',
        message: '',
        duration: 3000,
        dismissible: true,
      });

      expect(useToastStore.getState().toasts[0].message).toBe('');
    });

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(1000);
      useToastStore.getState().addToast({
        type: 'info',
        message: longMessage,
        duration: 3000,
        dismissible: true,
      });

      expect(useToastStore.getState().toasts[0].message).toBe(longMessage);
    });
  });
});
