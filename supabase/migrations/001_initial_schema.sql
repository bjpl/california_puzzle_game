-- California Puzzle Game - Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql
--
-- This schema matches the TypeScript types in src/lib/supabase.ts

-- ============================================
-- Enable UUID extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Game Sessions Table
-- ============================================
-- Stores each completed game for leaderboards and history

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'normal',
  region TEXT NOT NULL DEFAULT 'all',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_elapsed INTEGER NOT NULL DEFAULT 0, -- milliseconds
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0, -- percentage 0-100
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_difficulty ON game_sessions(difficulty);
CREATE INDEX idx_game_sessions_completed ON game_sessions(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read all sessions (for leaderboard), write own sessions
CREATE POLICY "Users can read all game sessions"
  ON game_sessions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own game sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game sessions"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own game sessions"
  ON game_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- User Progress Table
-- ============================================
-- Aggregate stats and achievements per user

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL DEFAULT 0,
  total_games INTEGER NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0,
  achievements TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookup
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_best ON user_progress(best_score DESC);

-- Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read all (leaderboard), manage own
CREATE POLICY "Users can read all user progress"
  ON user_progress FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Game Settings Table
-- ============================================
-- User preferences synced across devices

CREATE TABLE IF NOT EXISTS game_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Game settings
  difficulty TEXT NOT NULL DEFAULT 'normal',
  region TEXT NOT NULL DEFAULT 'all',
  show_hints BOOLEAN NOT NULL DEFAULT true,
  enable_timer BOOLEAN NOT NULL DEFAULT true,

  -- Audio settings
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  animations_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_advance BOOLEAN NOT NULL DEFAULT false,
  master_volume DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  effects_volume DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  music_volume DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  muted BOOLEAN NOT NULL DEFAULT false,
  enable_background_music BOOLEAN NOT NULL DEFAULT true,
  enable_click_sounds BOOLEAN NOT NULL DEFAULT true,
  enable_game_sounds BOOLEAN NOT NULL DEFAULT true,
  enable_achievement_sounds BOOLEAN NOT NULL DEFAULT true,

  -- Hint settings
  max_hints_per_level INTEGER NOT NULL DEFAULT 3,
  hint_cooldown_ms INTEGER NOT NULL DEFAULT 5000,
  score_penalty_per_hint INTEGER NOT NULL DEFAULT 10,
  free_hints_allowed INTEGER NOT NULL DEFAULT 1,
  auto_suggest_threshold INTEGER NOT NULL DEFAULT 30,
  enable_visual_indicators BOOLEAN NOT NULL DEFAULT true,
  enable_educational_hints BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookup
CREATE INDEX idx_game_settings_user ON game_settings(user_id);

-- Enable Row Level Security
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access own settings
CREATE POLICY "Users can read own settings"
  ON game_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON game_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON game_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Global Leaderboard View
-- ============================================

CREATE OR REPLACE VIEW leaderboard_global AS
SELECT
  gs.user_id,
  up.best_score,
  up.total_games,
  MAX(gs.accuracy) as best_accuracy,
  MIN(gs.time_elapsed) as best_time,
  RANK() OVER (ORDER BY up.best_score DESC) as rank
FROM game_sessions gs
JOIN user_progress up ON gs.user_id = up.user_id
GROUP BY gs.user_id, up.best_score, up.total_games
ORDER BY up.best_score DESC
LIMIT 100;

-- ============================================
-- Trigger: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_timestamp
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_game_settings_timestamp
  BEFORE UPDATE ON game_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Trigger: Auto-create progress on first game
-- ============================================

CREATE OR REPLACE FUNCTION create_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, total_score, total_games, best_score)
  VALUES (NEW.user_id, NEW.score, 1, NEW.score)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_score = user_progress.total_score + NEW.score,
    total_games = user_progress.total_games + 1,
    best_score = GREATEST(user_progress.best_score, NEW.score),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_progress
  AFTER INSERT ON game_sessions
  FOR EACH ROW EXECUTE FUNCTION create_user_progress();

-- ============================================
-- Enable Realtime for sync
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE user_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE game_settings;
