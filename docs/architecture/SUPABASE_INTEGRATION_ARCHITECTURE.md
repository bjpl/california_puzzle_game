# Supabase Integration Architecture

**Document Version:** 1.0.0
**Last Updated:** 2025-10-11
**Architecture Designer:** System Architect Agent
**Status:** Design Phase

## Executive Summary

This document outlines the architecture for integrating Supabase into the California Puzzle Game PWA. The design focuses on **anonymous authentication**, **progressive enhancement**, **offline-first capabilities**, and **data synchronization** while maintaining the existing localStorage-based game state management.

### Key Principles

1. **Progressive Enhancement**: Supabase is optional - app works fully without it
2. **Anonymous-First**: No user registration required for basic functionality
3. **Privacy-First**: Minimal data collection, GDPR/CCPA compliant
4. **Offline-First**: Local storage remains primary, Supabase syncs when online
5. **Performance**: Non-blocking initialization, lazy loading
6. **Security**: Environment-based configuration, no secrets in client code

---

## 1. System Architecture Overview

### 1.1 Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Game Store   │  │ Study Store  │  │ Theme Store  │      │
│  │   (Zustand)  │  │   (Zustand)  │  │   (Zustand)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Storage Abstraction Layer                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            StorageManager (Existing)                 │   │
│  │  - LocalStorage persistence                          │   │
│  │  - Profile management                                │   │
│  │  - Settings/Stats/Achievements                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           SyncManager (NEW)                          │   │
│  │  - Conflict resolution                               │   │
│  │  - Sync queue management                             │   │
│  │  - Network status monitoring                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Client Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │ DB Service   │  │ Sync Service │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │ Auth Gateway │  │ Realtime     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Actions                            │
│  (Play game, Update settings, Unlock achievements)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────────────────┐
                │   Zustand Store       │
                │   (Immediate update)  │
                └───────────────────────┘
                            ↓
        ┌───────────────────────────────────┐
        │                                   │
        ↓                                   ↓
┌──────────────────┐            ┌──────────────────┐
│ LocalStorage     │            │ Sync Queue       │
│ (Synchronous)    │            │ (Async, batched) │
└──────────────────┘            └──────────────────┘
                                         ↓
                                ┌──────────────────┐
                                │ Network Check    │
                                │ Online?          │
                                └──────────────────┘
                                    ↓        ↓
                            YES ────┘        └──── NO
                             ↓                     ↓
                    ┌──────────────┐      ┌──────────────┐
                    │ Supabase API │      │ Queue for    │
                    │ (Background) │      │ later sync   │
                    └──────────────┘      └──────────────┘
```

---

## 2. File Structure

### 2.1 New Directory Structure

```
src/
├── services/
│   └── supabase/
│       ├── client.ts              # Supabase client initialization
│       ├── auth.ts                # Anonymous auth & session management
│       ├── database.ts            # Database operations
│       ├── sync.ts                # Sync engine
│       ├── realtime.ts            # Realtime subscriptions (optional)
│       ├── types.ts               # Supabase-specific TypeScript types
│       └── config.ts              # Configuration & environment handling
│
├── hooks/
│   ├── useSupabase.ts             # Main Supabase hook
│   ├── useSupabaseAuth.ts         # Authentication hook
│   ├── useSupabaseSync.ts         # Sync status & control hook
│   └── useOnlineStatus.ts         # Network status detection
│
├── utils/
│   ├── sync/
│   │   ├── syncManager.ts         # Sync orchestration
│   │   ├── conflictResolver.ts    # Conflict resolution strategies
│   │   ├── syncQueue.ts           # Queue management
│   │   └── networkMonitor.ts      # Network status monitoring
│   │
│   └── storage/
│       └── storageAdapter.ts      # Abstraction over localStorage/Supabase
│
└── types/
    └── supabase.ts                # Database schema types (generated)
```

### 2.2 Configuration Files

```
project-root/
├── .env.example                   # Updated with Supabase vars
├── .env.development              # Local development
├── .env.production               # Production build
└── supabase/
    ├── config.toml               # Supabase project config
    ├── migrations/               # Database migrations
    │   └── 001_initial_schema.sql
    └── seed.sql                  # Development seed data
```

---

## 3. Supabase Client Configuration

### 3.1 Client Initialization Pattern

**File:** `src/services/supabase/client.ts`

```typescript
/**
 * Supabase Client Initialization
 *
 * PATTERN: Singleton with lazy initialization
 * WHY: Prevents initialization if env vars missing, reduces bundle impact
 * SECURITY: Environment variables, no hardcoded credentials
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

let supabaseClient: SupabaseClient<Database> | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
    global?: {
      headers?: Record<string, string>;
    };
  };
}

export function getSupabaseClient(): SupabaseClient<Database> | null {
  // Return existing instance if available
  if (supabaseClient) {
    return supabaseClient;
  }

  // Check for required environment variables
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.info('[Supabase] Not configured - running in offline mode');
    return null;
  }

  try {
    supabaseClient = createClient<Database>(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // PWA doesn't need URL-based auth
      },
      global: {
        headers: {
          'X-App-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
        },
      },
    });

    console.info('[Supabase] Client initialized successfully');
    return supabaseClient;
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL &&
            import.meta.env.VITE_SUPABASE_ANON_KEY);
}
```

### 3.2 Environment Variables

**Updated `.env.example`:**

```bash
# ============================================
# Supabase Configuration (Optional)
# ============================================

# Supabase Project URL
# Get from: https://app.supabase.com/project/_/settings/api
# VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Public Key
# Get from: https://app.supabase.com/project/_/settings/api
# VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Enable Supabase Sync (default: true if configured)
# VITE_SUPABASE_SYNC_ENABLED=true

# Sync interval in milliseconds (default: 30000 = 30 seconds)
# VITE_SUPABASE_SYNC_INTERVAL=30000

# Enable Realtime subscriptions (default: false)
# VITE_SUPABASE_REALTIME_ENABLED=false
```

---

## 4. Anonymous Authentication Strategy

### 4.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    App Initialization                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────────────────┐
                │ Check Supabase Config │
                │ Variables Present?    │
                └───────────────────────┘
                    ↓            ↓
            YES ────┘            └──── NO
             ↓                         ↓
┌─────────────────────┐      ┌──────────────────┐
│ Check Local Session │      │ Continue without │
│ in localStorage     │      │ Supabase         │
└─────────────────────┘      └──────────────────┘
         ↓           ↓
    Found ─┘        └─── Not Found
      ↓                      ↓
┌───────────┐      ┌──────────────────────┐
│ Validate  │      │ Create Anonymous User │
│ Session   │      │ supabase.auth.signIn  │
└───────────┘      │ Anonymous({ ... })    │
      ↓            └──────────────────────┘
      ↓                      ↓
      └──────────┬───────────┘
                 ↓
      ┌─────────────────────┐
      │ Store Session in    │
      │ localStorage        │
      │ + Supabase storage  │
      └─────────────────────┘
                 ↓
      ┌─────────────────────┐
      │ Enable Sync         │
      │ Background process  │
      └─────────────────────┘
```

### 4.2 Authentication Service

**File:** `src/services/supabase/auth.ts`

```typescript
/**
 * Supabase Anonymous Authentication Service
 *
 * PATTERN: Anonymous-first authentication with optional upgrade
 * WHY: No user registration required, privacy-friendly
 * SECURITY: Session tokens stored securely, auto-refresh
 */

import { getSupabaseClient } from './client';
import { logger } from '@/utils/logger';

export interface AuthStatus {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  userId: string | null;
  error?: string;
}

export async function initializeAuth(): Promise<AuthStatus> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      isAuthenticated: false,
      isAnonymous: false,
      userId: null,
    };
  }

  try {
    // Check for existing session
    const { data: { session }, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (session) {
      logger.info('[Auth] Existing session found');
      return {
        isAuthenticated: true,
        isAnonymous: session.user.is_anonymous ?? true,
        userId: session.user.id,
      };
    }

    // No session - create anonymous user
    logger.info('[Auth] Creating anonymous session...');

    const { data: { user }, error: signInError } =
      await supabase.auth.signInAnonymously({
        options: {
          data: {
            app_name: 'California Puzzle Game',
            created_at: new Date().toISOString(),
          },
        },
      });

    if (signInError || !user) {
      throw signInError || new Error('Anonymous sign-in failed');
    }

    logger.info('[Auth] Anonymous session created:', user.id);

    return {
      isAuthenticated: true,
      isAnonymous: true,
      userId: user.id,
    };
  } catch (error) {
    logger.error('[Auth] Authentication failed:', error);
    return {
      isAuthenticated: false,
      isAnonymous: false,
      userId: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function signOut(): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (!supabase) return false;

  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    logger.info('[Auth] Signed out successfully');
    return true;
  } catch (error) {
    logger.error('[Auth] Sign out failed:', error);
    return false;
  }
}

export function onAuthStateChange(
  callback: (authStatus: AuthStatus) => void
): () => void {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return () => {}; // No-op unsubscribe
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback({
        isAuthenticated: !!session,
        isAnonymous: session?.user.is_anonymous ?? false,
        userId: session?.user.id ?? null,
      });
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}
```

---

## 5. Database Schema Design

### 5.1 PostgreSQL Schema

**File:** `supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- User Profiles Table
-- ============================================
-- Stores extended profile information
-- Linked to Supabase auth.users via user_id
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  device_info JSONB DEFAULT '{}',
  app_version TEXT,

  -- Constraints
  UNIQUE(user_id)
);

-- ============================================
-- Game Settings Table
-- ============================================
-- Stores user preferences and game settings
-- Synced with localStorage
-- ============================================

CREATE TABLE game_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Game preferences
  difficulty TEXT NOT NULL DEFAULT 'easy',
  region TEXT NOT NULL DEFAULT 'bay_area',
  show_hints BOOLEAN NOT NULL DEFAULT true,
  enable_timer BOOLEAN NOT NULL DEFAULT true,
  animations_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Sound settings
  sound_settings JSONB NOT NULL DEFAULT '{}',

  -- Hint settings
  hint_settings JSONB NOT NULL DEFAULT '{}',

  -- User preferences
  theme TEXT NOT NULL DEFAULT 'auto',
  language TEXT NOT NULL DEFAULT 'en',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,

  -- Constraints
  UNIQUE(user_id)
);

-- ============================================
-- Game Statistics Table
-- ============================================
-- Tracks player performance metrics
-- ============================================

CREATE TABLE game_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Gameplay metrics
  total_games_played INTEGER NOT NULL DEFAULT 0,
  total_score BIGINT NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0,
  average_accuracy DECIMAL(5,4) NOT NULL DEFAULT 0,
  total_play_time BIGINT NOT NULL DEFAULT 0,

  -- Preferences
  favorite_difficulty TEXT,
  favorite_region TEXT,

  -- Achievements
  counties_learned TEXT[] DEFAULT ARRAY[]::TEXT[],
  perfect_placements INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,

  -- Constraints
  UNIQUE(user_id)
);

-- ============================================
-- Game Sessions Table
-- ============================================
-- Individual gameplay session records
-- ============================================

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Session details
  region TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  time_elapsed INTEGER NOT NULL DEFAULT 0,

  -- Performance
  placements_correct INTEGER NOT NULL DEFAULT 0,
  placements_total INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,4),

  -- Achievements unlocked during session
  achievements_unlocked TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Indexes
  CHECK (placements_correct <= placements_total),
  CHECK (accuracy >= 0 AND accuracy <= 1)
);

-- ============================================
-- Achievements Table
-- ============================================
-- Player achievement tracking
-- ============================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Achievement details
  achievement_id TEXT NOT NULL,
  progress DECIMAL(5,4) NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(user_id, achievement_id),
  CHECK (progress >= 0 AND progress <= 1)
);

-- ============================================
-- Leaderboard Table (Optional)
-- ============================================
-- Global leaderboard for competitive play
-- ============================================

CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Performance
  score INTEGER NOT NULL,
  region TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  completion_time INTEGER NOT NULL,
  accuracy DECIMAL(5,4) NOT NULL,

  -- Display
  display_name TEXT,

  -- Timestamps
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Indexes for leaderboard queries
  CHECK (accuracy >= 0 AND accuracy <= 1)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_game_settings_user_id ON game_settings(user_id);
CREATE INDEX idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at DESC);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_unlocked ON achievements(user_id, is_unlocked);
CREATE INDEX idx_leaderboard_score ON leaderboard(region, difficulty, score DESC);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON game_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON game_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats" ON game_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON game_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own achievements" ON achievements
  FOR ALL USING (auth.uid() = user_id);

-- Leaderboard: Users can insert their own scores, everyone can read
CREATE POLICY "Users can insert own scores" ON leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard" ON leaderboard
  FOR SELECT USING (true);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_settings_updated_at
  BEFORE UPDATE ON game_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_stats_updated_at
  BEFORE UPDATE ON game_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 6. Sync Engine Architecture

### 6.1 Sync Strategy

**Conflict Resolution: Last-Write-Wins with Version Control**

```
Local Change               Cloud Change
     ↓                          ↓
┌─────────┐              ┌─────────┐
│ v1 → v2 │              │ v1 → v2 │
└─────────┘              └─────────┘
     ↓                          ↓
     └──────────┬───────────────┘
                ↓
        ┌──────────────┐
        │ Compare      │
        │ - Timestamp  │
        │ - Version    │
        └──────────────┘
                ↓
    ┌───────────────────────┐
    │ Resolution Strategy:  │
    │                       │
    │ 1. Newest wins       │
    │ 2. Merge if possible │
    │ 3. Flag conflicts    │
    └───────────────────────┘
```

### 6.2 Sync Manager

**File:** `src/utils/sync/syncManager.ts`

```typescript
/**
 * Sync Manager
 *
 * PATTERN: Queue-based background synchronization
 * WHY: Non-blocking, handles offline scenarios, conflict resolution
 * STRATEGY: Last-write-wins with version control
 */

import { getSupabaseClient } from '@/services/supabase/client';
import { storageManager } from '@/utils/storage';
import { logger } from '@/utils/logger';

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  pendingChanges: number;
  syncErrors: SyncError[];
}

export interface SyncError {
  table: string;
  operation: 'insert' | 'update' | 'delete';
  error: string;
  timestamp: Date;
}

class SyncManager {
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  private syncInterval: number | null = null;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  constructor() {
    this.loadPendingOperations();
  }

  // Start automatic sync
  public startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, intervalMs);

    // Initial sync
    this.sync();
  }

  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Manual sync trigger
  public async sync(): Promise<void> {
    if (this.isSyncing) {
      logger.info('[Sync] Already syncing, skipping...');
      return;
    }

    if (!navigator.onLine) {
      logger.info('[Sync] Offline, queueing changes...');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      logger.info('[Sync] Supabase not configured');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners();

    try {
      logger.info('[Sync] Starting sync...');

      // Process queued operations
      await this.processQueue();

      // Sync settings
      await this.syncSettings();

      // Sync stats
      await this.syncStats();

      // Sync achievements
      await this.syncAchievements();

      logger.info('[Sync] Sync completed successfully');
    } catch (error) {
      logger.error('[Sync] Sync failed:', error);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async processQueue(): Promise<void> {
    // Implementation for processing queued operations
  }

  private async syncSettings(): Promise<void> {
    // Implementation for syncing settings
  }

  private async syncStats(): Promise<void> {
    // Implementation for syncing stats
  }

  private async syncAchievements(): Promise<void> {
    // Implementation for syncing achievements
  }

  private loadPendingOperations(): void {
    // Load operations from localStorage
  }

  private savePendingOperations(): void {
    // Save operations to localStorage
  }

  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  public getStatus(): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      lastSyncAt: null, // TODO: Track last sync
      pendingChanges: this.syncQueue.length,
      syncErrors: [],
    };
  }

  public addListener(listener: (status: SyncStatus) => void): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: (status: SyncStatus) => void): void {
    this.listeners.delete(listener);
  }
}

export const syncManager = new SyncManager();
```

---

## 7. React Integration

### 7.1 Main Supabase Hook

**File:** `src/hooks/useSupabase.ts`

```typescript
/**
 * Main Supabase Hook
 *
 * PATTERN: React hook for Supabase access with auth state
 * WHY: Centralized Supabase access with React lifecycle integration
 */

import { useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/services/supabase/client';
import { initializeAuth, type AuthStatus } from '@/services/supabase/auth';
import { logger } from '@/utils/logger';

export function useSupabase() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    isAnonymous: false,
    userId: null,
  });
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsInitializing(false);
      logger.info('[Supabase] Not configured, skipping initialization');
      return;
    }

    const initialize = async () => {
      try {
        const status = await initializeAuth();
        setAuthStatus(status);
      } catch (error) {
        logger.error('[Supabase] Initialization failed:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  return {
    supabase: getSupabaseClient(),
    authStatus,
    isInitializing,
    isConfigured: isSupabaseConfigured(),
  };
}
```

---

## 8. Security Considerations

### 8.1 Security Checklist

- ✅ **Environment Variables**: Never commit secrets to repository
- ✅ **Row Level Security (RLS)**: All tables protected by RLS policies
- ✅ **Anonymous Auth**: Minimal user data collection
- ✅ **API Keys**: Only anon key exposed in client (safe for public use)
- ✅ **HTTPS Only**: Supabase requires HTTPS in production
- ✅ **Content Security Policy**: Update CSP to allow Supabase domain
- ✅ **Session Management**: Auto-refresh tokens, secure storage

### 8.2 CSP Updates

**File:** `index.html` (or middleware)

```html
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        connect-src 'self' https://*.supabase.co wss://*.supabase.co;
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
      ">
```

---

## 9. Offline/Online Sync Considerations

### 9.1 PWA Integration

The existing Service Worker (`public/sw.js`) already handles:
- Offline asset caching
- Background sync capabilities
- Network status detection

### 9.2 Sync Strategy Integration

```typescript
// Listen for online/offline events
window.addEventListener('online', () => {
  syncManager.sync(); // Trigger immediate sync when back online
});

window.addEventListener('offline', () => {
  syncManager.stopAutoSync(); // Stop sync attempts when offline
});

// Service Worker background sync
if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('supabase-sync');
  });
}
```

---

## 10. Performance Optimization

### 10.1 Bundle Size Impact

- **Supabase JS SDK**: ~50KB gzipped
- **Lazy Loading**: Load only when configured
- **Code Splitting**: Separate Supabase code chunk

**Vite config update:**

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'supabase': ['@supabase/supabase-js'],
      }
    }
  }
}
```

### 10.2 Network Optimization

- **Batching**: Group multiple operations
- **Debouncing**: Sync after inactivity period
- **Compression**: Use Supabase's built-in compression
- **Caching**: Cache frequently accessed data locally

---

## 11. Error Handling

### 11.1 Error Handling Strategy

```typescript
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    logger.error(`[Supabase] ${context} failed:`, error);

    // Handle specific error types
    if (error.code === 'PGRST116') {
      // No rows returned - expected scenario
      return null;
    }

    // Report to error tracking
    reportError(error, { context });

    return null;
  }
}
```

---

## 12. Testing Strategy

### 12.1 Test Coverage Areas

1. **Unit Tests**
   - Supabase client initialization
   - Auth service methods
   - Sync queue operations
   - Conflict resolution logic

2. **Integration Tests**
   - End-to-end auth flow
   - Data sync scenarios
   - Offline/online transitions
   - Conflict resolution

3. **E2E Tests**
   - Complete game session with sync
   - Multi-device sync simulation
   - Network interruption scenarios

---

## 13. Migration Plan

### 13.1 Phased Rollout

**Phase 1: Foundation (Week 1)**
- ✅ Database schema
- ✅ Supabase client setup
- ✅ Environment configuration
- ✅ Basic auth implementation

**Phase 2: Core Sync (Week 2)**
- ⬜ Sync manager implementation
- ⬜ Settings sync
- ⬜ Stats sync
- ⬜ Achievement sync

**Phase 3: Testing & Refinement (Week 3)**
- ⬜ Unit tests
- ⬜ Integration tests
- ⬜ Performance optimization
- ⬜ Error handling

**Phase 4: Production Deployment (Week 4)**
- ⬜ Production environment setup
- ⬜ Monitoring & logging
- ⬜ Documentation
- ⬜ Gradual rollout (feature flag)

---

## 14. Monitoring & Analytics

### 14.1 Key Metrics

- **Sync Success Rate**: % of successful syncs
- **Sync Latency**: Time to complete sync
- **Conflict Rate**: % of operations with conflicts
- **Anonymous User Retention**: Active anonymous users
- **Storage Usage**: Database size per user

### 14.2 Logging Strategy

```typescript
// Structured logging for sync operations
logger.info('[Sync]', {
  operation: 'sync_settings',
  duration: 1234,
  recordsUpdated: 1,
  success: true,
});
```

---

## 15. Future Enhancements

### 15.1 Optional Features (Post-MVP)

1. **Account Upgrade**: Convert anonymous to registered user
2. **Cross-Device Sync**: Realtime sync across devices
3. **Leaderboards**: Global/regional competitive play
4. **Social Features**: Share achievements, challenge friends
5. **Cloud Backups**: Export/import game data
6. **Analytics Dashboard**: Personal progress tracking

---

## Conclusion

This architecture provides a **robust, privacy-first, offline-first** Supabase integration that enhances the California Puzzle Game without compromising its core PWA functionality. The design is:

- ✅ **Progressive**: Works without Supabase
- ✅ **Secure**: RLS, environment-based config, anonymous auth
- ✅ **Performant**: Non-blocking sync, lazy loading
- ✅ **Maintainable**: Clear separation of concerns, testable
- ✅ **Scalable**: Ready for future enhancements

---

## Architecture Decision Records (ADRs)

### ADR-001: Anonymous Authentication as Default

**Status**: Accepted
**Context**: Minimize friction for new users
**Decision**: Use anonymous Supabase auth by default
**Consequences**: Higher privacy, simpler onboarding, potential for upgrade path

### ADR-002: Last-Write-Wins Conflict Resolution

**Status**: Accepted
**Context**: Simple conflict resolution for single-player game
**Decision**: Use timestamp-based last-write-wins
**Consequences**: Simple implementation, may lose some data in edge cases

### ADR-003: LocalStorage as Primary Storage

**Status**: Accepted
**Context**: Maintain offline-first PWA functionality
**Decision**: Keep localStorage as source of truth, Supabase as backup
**Consequences**: Fast local access, resilient to network issues

---

**Document Prepared By:** System Architect Agent
**Review Status:** Pending Code Review
**Next Steps:** Implementation by Coder Agent
