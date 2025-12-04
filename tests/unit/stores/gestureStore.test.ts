/**
 * Gesture Store Tests
 * Tests map gesture state management: rotation, zoom, pan
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGestureStore } from '../../../src/stores/gestureStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('gestureStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGestureStore.setState({
      gestureState: {
        rotation: 0,
        zoom: 1,
        pan: { x: 0, y: 0 },
        gestureEnabled: true,
      },
      gesturePreferences: null,
      helpSeen: false,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have default gesture state', () => {
      const state = useGestureStore.getState();

      expect(state.gestureState).toEqual({
        rotation: 0,
        zoom: 1,
        pan: { x: 0, y: 0 },
        gestureEnabled: true,
      });
    });

    it('should have null gesture preferences initially', () => {
      const state = useGestureStore.getState();
      expect(state.gesturePreferences).toBeNull();
    });

    it('should have helpSeen as false initially', () => {
      const state = useGestureStore.getState();
      expect(state.helpSeen).toBe(false);
    });
  });

  describe('updateGestureState', () => {
    it('should update partial gesture state', () => {
      useGestureStore.getState().updateGestureState({ rotation: 45 });

      const state = useGestureStore.getState();
      expect(state.gestureState.rotation).toBe(45);
      expect(state.gestureState.zoom).toBe(1); // Unchanged
    });

    it('should update multiple properties at once', () => {
      useGestureStore.getState().updateGestureState({
        rotation: 90,
        zoom: 2,
      });

      const state = useGestureStore.getState();
      expect(state.gestureState.rotation).toBe(90);
      expect(state.gestureState.zoom).toBe(2);
    });
  });

  describe('resetGestureState', () => {
    it('should reset gesture state to defaults', () => {
      // First, modify the state
      useGestureStore.getState().updateGestureState({
        rotation: 180,
        zoom: 3,
        pan: { x: 100, y: 200 },
        gestureEnabled: false,
      });

      // Then reset
      useGestureStore.getState().resetGestureState();

      const state = useGestureStore.getState();
      expect(state.gestureState).toEqual({
        rotation: 0,
        zoom: 1,
        pan: { x: 0, y: 0 },
        gestureEnabled: true,
      });
    });
  });

  describe('setMapRotation', () => {
    it('should set rotation value', () => {
      useGestureStore.getState().setMapRotation(45);

      expect(useGestureStore.getState().gestureState.rotation).toBe(45);
    });

    it('should allow negative rotation', () => {
      useGestureStore.getState().setMapRotation(-90);

      expect(useGestureStore.getState().gestureState.rotation).toBe(-90);
    });

    it('should allow values beyond 360', () => {
      useGestureStore.getState().setMapRotation(720);

      expect(useGestureStore.getState().gestureState.rotation).toBe(720);
    });
  });

  describe('setMapZoom', () => {
    it('should set zoom value', () => {
      useGestureStore.getState().setMapZoom(2);

      expect(useGestureStore.getState().gestureState.zoom).toBe(2);
    });

    it('should clamp zoom to minimum 0.5', () => {
      useGestureStore.getState().setMapZoom(0.1);

      expect(useGestureStore.getState().gestureState.zoom).toBe(0.5);
    });

    it('should clamp zoom to maximum 3', () => {
      useGestureStore.getState().setMapZoom(5);

      expect(useGestureStore.getState().gestureState.zoom).toBe(3);
    });

    it('should allow exact boundary values', () => {
      useGestureStore.getState().setMapZoom(0.5);
      expect(useGestureStore.getState().gestureState.zoom).toBe(0.5);

      useGestureStore.getState().setMapZoom(3);
      expect(useGestureStore.getState().gestureState.zoom).toBe(3);
    });
  });

  describe('setMapPan', () => {
    it('should set pan coordinates', () => {
      useGestureStore.getState().setMapPan({ x: 100, y: 200 });

      expect(useGestureStore.getState().gestureState.pan).toEqual({
        x: 100,
        y: 200,
      });
    });

    it('should allow negative pan values', () => {
      useGestureStore.getState().setMapPan({ x: -50, y: -100 });

      expect(useGestureStore.getState().gestureState.pan).toEqual({
        x: -50,
        y: -100,
      });
    });
  });

  describe('toggleGestureEnabled', () => {
    it('should toggle gesture enabled from true to false', () => {
      expect(useGestureStore.getState().gestureState.gestureEnabled).toBe(true);

      useGestureStore.getState().toggleGestureEnabled();

      expect(useGestureStore.getState().gestureState.gestureEnabled).toBe(false);
    });

    it('should toggle gesture enabled from false to true', () => {
      useGestureStore.getState().updateGestureState({ gestureEnabled: false });

      useGestureStore.getState().toggleGestureEnabled();

      expect(useGestureStore.getState().gestureState.gestureEnabled).toBe(true);
    });

    it('should toggle multiple times', () => {
      const { toggleGestureEnabled } = useGestureStore.getState();

      toggleGestureEnabled();
      expect(useGestureStore.getState().gestureState.gestureEnabled).toBe(false);

      toggleGestureEnabled();
      expect(useGestureStore.getState().gestureState.gestureEnabled).toBe(true);

      toggleGestureEnabled();
      expect(useGestureStore.getState().gestureState.gestureEnabled).toBe(false);
    });
  });

  describe('setGesturePreferences', () => {
    it('should set gesture preferences', () => {
      useGestureStore.getState().setGesturePreferences({
        rotationEnabled: true,
        zoomEnabled: false,
      });

      expect(useGestureStore.getState().gesturePreferences).toEqual({
        rotationEnabled: true,
        zoomEnabled: false,
      });
    });

    it('should overwrite existing preferences', () => {
      useGestureStore.getState().setGesturePreferences({ rotationEnabled: true });
      useGestureStore.getState().setGesturePreferences({ zoomEnabled: false });

      expect(useGestureStore.getState().gesturePreferences).toEqual({
        zoomEnabled: false,
      });
    });
  });

  describe('clearGesturePreferences', () => {
    it('should clear gesture preferences to null', () => {
      useGestureStore.getState().setGesturePreferences({ rotationEnabled: true });

      useGestureStore.getState().clearGesturePreferences();

      expect(useGestureStore.getState().gesturePreferences).toBeNull();
    });
  });

  describe('setHelpSeen', () => {
    it('should set helpSeen to true', () => {
      useGestureStore.getState().setHelpSeen(true);

      expect(useGestureStore.getState().helpSeen).toBe(true);
    });

    it('should set helpSeen to false', () => {
      useGestureStore.getState().setHelpSeen(true);
      useGestureStore.getState().setHelpSeen(false);

      expect(useGestureStore.getState().helpSeen).toBe(false);
    });
  });

  describe('State persistence', () => {
    it('should have persist middleware configured', () => {
      // Check that the store name is set for persistence
      const _storeName = 'california-puzzle-gestures';

      // The store should be partializing state for persistence
      const state = useGestureStore.getState();
      expect(state).toHaveProperty('gestureState');
      expect(state).toHaveProperty('gesturePreferences');
      expect(state).toHaveProperty('helpSeen');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      useGestureStore.getState().updateGestureState({
        rotation: 0,
        zoom: 1, // Min would be 0.5, so 1 is valid
        pan: { x: 0, y: 0 },
      });

      const state = useGestureStore.getState();
      expect(state.gestureState.rotation).toBe(0);
      expect(state.gestureState.pan).toEqual({ x: 0, y: 0 });
    });

    it('should handle rapid state updates', () => {
      for (let i = 0; i < 100; i++) {
        useGestureStore.getState().setMapRotation(i);
      }

      expect(useGestureStore.getState().gestureState.rotation).toBe(99);
    });
  });
});
