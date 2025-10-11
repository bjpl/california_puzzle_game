/**
 * Supabase Database Types
 *
 * Auto-generated types for Supabase database schema.
 * These types are manually created to match the database schema
 * defined in supabase/migrations/001_initial_schema.sql
 *
 * @module services/supabase/types
 * @see supabase/migrations/001_initial_schema.sql
 */

/**
 * Main database schema interface
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      game_settings: {
        Row: GameSettings;
        Insert: GameSettingsInsert;
        Update: GameSettingsUpdate;
      };
      game_stats: {
        Row: GameStats;
        Insert: GameStatsInsert;
        Update: GameStatsUpdate;
      };
      game_sessions: {
        Row: GameSession;
        Insert: GameSessionInsert;
        Update: GameSessionUpdate;
      };
      achievements: {
        Row: Achievement;
        Insert: AchievementInsert;
        Update: AchievementUpdate;
      };
      leaderboard: {
        Row: LeaderboardEntry;
        Insert: LeaderboardEntryInsert;
        Update: LeaderboardEntryUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

/**
 * User profile
 */
export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
  device_info: Record<string, unknown>;
  app_version: string | null;
}

export interface ProfileInsert {
  id?: string;
  user_id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  last_synced_at?: string | null;
  device_info?: Record<string, unknown>;
  app_version?: string | null;
}

export interface ProfileUpdate {
  id?: string;
  user_id?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  last_synced_at?: string | null;
  device_info?: Record<string, unknown>;
  app_version?: string | null;
}

/**
 * Game settings
 */
export interface GameSettings {
  id: string;
  user_id: string;
  difficulty: string;
  region: string;
  show_hints: boolean;
  enable_timer: boolean;
  animations_enabled: boolean;
  sound_settings: SoundSettingsJson;
  hint_settings: HintSettingsJson;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface GameSettingsInsert {
  id?: string;
  user_id: string;
  difficulty?: string;
  region?: string;
  show_hints?: boolean;
  enable_timer?: boolean;
  animations_enabled?: boolean;
  sound_settings?: SoundSettingsJson;
  hint_settings?: HintSettingsJson;
  theme?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  version?: number;
}

export interface GameSettingsUpdate {
  id?: string;
  user_id?: string;
  difficulty?: string;
  region?: string;
  show_hints?: boolean;
  enable_timer?: boolean;
  animations_enabled?: boolean;
  sound_settings?: SoundSettingsJson;
  hint_settings?: HintSettingsJson;
  theme?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  version?: number;
}

/**
 * Sound settings JSON structure
 */
export interface SoundSettingsJson {
  masterVolume?: number;
  effectsVolume?: number;
  musicVolume?: number;
  muted?: boolean;
  enableBackgroundMusic?: boolean;
  enableClickSounds?: boolean;
  enableGameSounds?: boolean;
  enableAchievementSounds?: boolean;
}

/**
 * Hint settings JSON structure
 */
export interface HintSettingsJson {
  maxHintsPerLevel?: number;
  hintCooldownMs?: number;
  scorePenaltyPerHint?: number;
  freeHintsAllowed?: number;
  autoSuggestThreshold?: number;
  enableVisualIndicators?: boolean;
  enableEducationalHints?: boolean;
}

/**
 * Game statistics
 */
export interface GameStats {
  id: string;
  user_id: string;
  total_games_played: number;
  total_score: number;
  best_score: number;
  average_accuracy: number;
  total_play_time: number;
  favorite_difficulty: string | null;
  favorite_region: string | null;
  counties_learned: string[];
  perfect_placements: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface GameStatsInsert {
  id?: string;
  user_id: string;
  total_games_played?: number;
  total_score?: number;
  best_score?: number;
  average_accuracy?: number;
  total_play_time?: number;
  favorite_difficulty?: string | null;
  favorite_region?: string | null;
  counties_learned?: string[];
  perfect_placements?: number;
  longest_streak?: number;
  created_at?: string;
  updated_at?: string;
  version?: number;
}

export interface GameStatsUpdate {
  id?: string;
  user_id?: string;
  total_games_played?: number;
  total_score?: number;
  best_score?: number;
  average_accuracy?: number;
  total_play_time?: number;
  favorite_difficulty?: string | null;
  favorite_region?: string | null;
  counties_learned?: string[];
  perfect_placements?: number;
  longest_streak?: number;
  created_at?: string;
  updated_at?: string;
  version?: number;
}

/**
 * Game session
 */
export interface GameSession {
  id: string;
  user_id: string;
  region: string;
  difficulty: string;
  score: number;
  time_elapsed: number;
  placements_correct: number;
  placements_total: number;
  hints_used: number;
  accuracy: number | null;
  achievements_unlocked: string[];
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface GameSessionInsert {
  id?: string;
  user_id: string;
  region: string;
  difficulty: string;
  score?: number;
  time_elapsed?: number;
  placements_correct?: number;
  placements_total?: number;
  hints_used?: number;
  accuracy?: number | null;
  achievements_unlocked?: string[];
  started_at?: string;
  ended_at?: string | null;
  created_at?: string;
}

export interface GameSessionUpdate {
  id?: string;
  user_id?: string;
  region?: string;
  difficulty?: string;
  score?: number;
  time_elapsed?: number;
  placements_correct?: number;
  placements_total?: number;
  hints_used?: number;
  accuracy?: number | null;
  achievements_unlocked?: string[];
  started_at?: string;
  ended_at?: string | null;
  created_at?: string;
}

/**
 * Achievement
 */
export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AchievementInsert {
  id?: string;
  user_id: string;
  achievement_id: string;
  progress?: number;
  is_unlocked?: boolean;
  unlocked_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AchievementUpdate {
  id?: string;
  user_id?: string;
  achievement_id?: string;
  progress?: number;
  is_unlocked?: boolean;
  unlocked_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  region: string;
  difficulty: string;
  completion_time: number;
  accuracy: number;
  display_name: string | null;
  achieved_at: string;
  created_at: string;
}

export interface LeaderboardEntryInsert {
  id?: string;
  user_id: string;
  score: number;
  region: string;
  difficulty: string;
  completion_time: number;
  accuracy: number;
  display_name?: string | null;
  achieved_at?: string;
  created_at?: string;
}

export interface LeaderboardEntryUpdate {
  id?: string;
  user_id?: string;
  score?: number;
  region?: string;
  difficulty?: string;
  completion_time?: number;
  accuracy?: number;
  display_name?: string | null;
  achieved_at?: string;
  created_at?: string;
}

/**
 * Sync metadata for tracking synchronization state
 */
export interface SyncMetadata {
  lastSyncAt: string;
  syncVersion: number;
  pendingChanges: number;
  syncErrors: SyncError[];
}

/**
 * Sync error details
 */
export interface SyncError {
  table: string;
  operation: 'insert' | 'update' | 'delete';
  error: string;
  timestamp: string;
  retryCount?: number;
}
