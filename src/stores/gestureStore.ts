/**
 * Gesture Store
 * Manages map gestures: rotation, zoom, pan
 * Single responsibility: gesture state management
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GestureState } from '@/types';
import type { GestureConfig } from '@/hooks/useGestureRecognition';

export interface GestureStoreState {
  gestureState: GestureState;
  gesturePreferences: Partial<GestureConfig> | null;
  helpSeen: boolean;
}

interface GestureActions {
  updateGestureState: (updates: Partial<GestureState>) => void;
  resetGestureState: () => void;
  setMapRotation: (rotation: number) => void;
  setMapZoom: (zoom: number) => void;
  setMapPan: (pan: { x: number; y: number }) => void;
  toggleGestureEnabled: () => void;
  setGesturePreferences: (prefs: Partial<GestureConfig>) => void;
  clearGesturePreferences: () => void;
  setHelpSeen: (seen: boolean) => void;
}

export type GestureStore = GestureStoreState & GestureActions;

const defaultGestureState: GestureState = {
  rotation: 0,
  zoom: 1,
  pan: { x: 0, y: 0 },
  gestureEnabled: true,
};

export const useGestureStore = create<GestureStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        gestureState: defaultGestureState,
        gesturePreferences: null,
        helpSeen: false,

        updateGestureState: (updates: Partial<GestureState>) => {
          set((state) => ({
            gestureState: { ...state.gestureState, ...updates },
          }));
        },

        resetGestureState: () => {
          set({ gestureState: defaultGestureState });
        },

        setMapRotation: (rotation: number) => {
          set((state) => ({
            gestureState: { ...state.gestureState, rotation },
          }));
        },

        setMapZoom: (zoom: number) => {
          // Clamp zoom between 0.5 and 3
          const clampedZoom = Math.max(0.5, Math.min(3, zoom));
          set((state) => ({
            gestureState: { ...state.gestureState, zoom: clampedZoom },
          }));
        },

        setMapPan: (pan: { x: number; y: number }) => {
          set((state) => ({
            gestureState: { ...state.gestureState, pan },
          }));
        },

        toggleGestureEnabled: () => {
          set((state) => ({
            gestureState: {
              ...state.gestureState,
              gestureEnabled: !state.gestureState.gestureEnabled,
            },
          }));
        },

        setGesturePreferences: (prefs: Partial<GestureConfig>) => {
          set({ gesturePreferences: prefs });
        },

        clearGesturePreferences: () => {
          set({ gesturePreferences: null });
        },

        setHelpSeen: (seen: boolean) => {
          set({ helpSeen: seen });
        },
      }),
      {
        name: 'california-puzzle-gestures',
        partialize: (state) => ({
          gestureState: state.gestureState,
          gesturePreferences: state.gesturePreferences,
          helpSeen: state.helpSeen,
        }),
      }
    ),
    { name: 'Gestures' }
  )
);
