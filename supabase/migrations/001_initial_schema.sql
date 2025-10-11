-- ============================================
-- California Counties Puzzle Game
-- Supabase Database Schema - Initial Migration
-- ============================================
-- Version: 1.0.0
-- Created: 2025-10-11
-- Description: Initial schema for anonymous user data sync
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================
-- User Profiles Table
-- ============================================
-- Stores extended profile information
-- Linked to Supabase auth.users via user_id
-- Supports both anonymous and registered users
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

COMMENT ON TABLE profiles IS 'User profile data with device tracking';
COMMENT ON COLUMN profiles.user_id IS 'Foreign key to auth.users - supports anonymous users';
COMMENT ON COLUMN profiles.device_info IS 'JSON object with device type, OS, browser info';

-- ============================================
-- Game Settings Table
-- ============================================
-- Stores user preferences and game settings
-- Synced with localStorage for offline-first
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

  -- Sound settings (JSONB for flexibility)
  sound_settings JSONB NOT NULL DEFAULT '{
    "masterVolume": 0.7,
    "effectsVolume": 0.8,
    "musicVolume": 0.5,
    "muted": false,
    "enableBackgroundMusic": true,
    "enableClickSounds": true,
    "enableGameSounds": true,
    "enableAchievementSounds": true
  }'::jsonb,

  -- Hint settings (JSONB for flexibility)
  hint_settings JSONB NOT NULL DEFAULT '{
    "maxHintsPerLevel": 3,
    "hintCooldownMs": 10000,
    "scorePenaltyPerHint": 50,
    "freeHintsAllowed": 1,
    "autoSuggestThreshold": 3,
    "enableVisualIndicators": true,
    "enableEducationalHints": true
  }'::jsonb,

  -- User preferences
  theme TEXT NOT NULL DEFAULT 'auto',
  language TEXT NOT NULL DEFAULT 'en',

  -- Sync metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,

  -- Constraints
  UNIQUE(user_id),
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  CHECK (theme IN ('light', 'dark', 'auto'))
);

COMMENT ON TABLE game_settings IS 'User game preferences synced with localStorage';
COMMENT ON COLUMN game_settings.version IS 'Increments on each update for conflict resolution';

-- ============================================
-- Game Statistics Table
-- ============================================
-- Tracks player performance metrics
-- Aggregated data for analytics and leaderboards
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

  -- Preferences (derived from play patterns)
  favorite_difficulty TEXT,
  favorite_region TEXT,

  -- Achievements
  counties_learned TEXT[] DEFAULT ARRAY[]::TEXT[],
  perfect_placements INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,

  -- Sync metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,

  -- Constraints
  UNIQUE(user_id),
  CHECK (total_games_played >= 0),
  CHECK (total_score >= 0),
  CHECK (best_score >= 0),
  CHECK (average_accuracy >= 0 AND average_accuracy <= 1),
  CHECK (perfect_placements >= 0),
  CHECK (longest_streak >= 0)
);

COMMENT ON TABLE game_stats IS 'Aggregated player statistics for analytics';
COMMENT ON COLUMN game_stats.counties_learned IS 'Array of county IDs the player has learned';
COMMENT ON COLUMN game_stats.total_play_time IS 'Total milliseconds spent playing';

-- ============================================
-- Game Sessions Table
-- ============================================
-- Individual gameplay session records
-- Enables detailed performance tracking
-- ============================================

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Session details
  region TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  time_elapsed INTEGER NOT NULL DEFAULT 0,

  -- Performance metrics
  placements_correct INTEGER NOT NULL DEFAULT 0,
  placements_total INTEGER NOT NULL DEFAULT 0,
  hints_used INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,4),

  -- Achievements unlocked during this session
  achievements_unlocked TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CHECK (placements_correct <= placements_total),
  CHECK (accuracy >= 0 AND accuracy <= 1),
  CHECK (score >= 0),
  CHECK (time_elapsed >= 0),
  CHECK (hints_used >= 0),
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert'))
);

COMMENT ON TABLE game_sessions IS 'Individual game session records for detailed analytics';
COMMENT ON COLUMN game_sessions.time_elapsed IS 'Session duration in milliseconds';
COMMENT ON COLUMN game_sessions.accuracy IS 'Calculated as placements_correct / placements_total';

-- ============================================
-- Achievements Table
-- ============================================
-- Player achievement tracking
-- Supports progressive unlocking and tracking
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
  CHECK (progress >= 0 AND progress <= 1),
  CHECK (
    (is_unlocked = false AND unlocked_at IS NULL) OR
    (is_unlocked = true AND unlocked_at IS NOT NULL)
  )
);

COMMENT ON TABLE achievements IS 'User achievement tracking with progress';
COMMENT ON COLUMN achievements.achievement_id IS 'References achievement definitions in app code';
COMMENT ON COLUMN achievements.progress IS 'Achievement progress from 0 to 1';

-- ============================================
-- Leaderboard Table
-- ============================================
-- Global leaderboard for competitive play
-- Optional feature - can be disabled
-- ============================================

CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Performance metrics
  score INTEGER NOT NULL,
  region TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  completion_time INTEGER NOT NULL,
  accuracy DECIMAL(5,4) NOT NULL,

  -- Display information
  display_name TEXT,

  -- Timestamps
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CHECK (score >= 0),
  CHECK (completion_time > 0),
  CHECK (accuracy >= 0 AND accuracy <= 1),
  CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert'))
);

COMMENT ON TABLE leaderboard IS 'Global leaderboard entries';
COMMENT ON COLUMN leaderboard.completion_time IS 'Time to complete game in milliseconds';
COMMENT ON COLUMN leaderboard.display_name IS 'Optional display name (defaults to Anonymous)';

-- ============================================
-- Indexes for Performance
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_last_synced ON profiles(last_synced_at DESC);

-- Game Settings
CREATE INDEX idx_game_settings_user_id ON game_settings(user_id);
CREATE INDEX idx_game_settings_updated ON game_settings(updated_at DESC);

-- Game Stats
CREATE INDEX idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX idx_game_stats_best_score ON game_stats(best_score DESC);

-- Game Sessions
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_started_at ON game_sessions(started_at DESC);
CREATE INDEX idx_game_sessions_region_difficulty ON game_sessions(region, difficulty);

-- Achievements
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_unlocked ON achievements(user_id, is_unlocked) WHERE is_unlocked = true;

-- Leaderboard
CREATE INDEX idx_leaderboard_region_difficulty_score ON leaderboard(region, difficulty, score DESC);
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_achieved_at ON leaderboard(achieved_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Game Settings policies
CREATE POLICY "Users can view own settings"
  ON game_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON game_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON game_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Game Stats policies
CREATE POLICY "Users can view own stats"
  ON game_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON game_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON game_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Game Sessions policies
CREATE POLICY "Users can view own sessions"
  ON game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON game_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON achievements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Leaderboard policies
CREATE POLICY "Users can insert own leaderboard entries"
  ON leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

-- ============================================
-- Triggers for Automatic Updates
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_settings_updated_at
  BEFORE UPDATE ON game_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_stats_updated_at
  BEFORE UPDATE ON game_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Helper Functions
-- ============================================

-- Function to calculate session accuracy
CREATE OR REPLACE FUNCTION calculate_session_accuracy()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.placements_total > 0 THEN
    NEW.accuracy = NEW.placements_correct::DECIMAL / NEW.placements_total::DECIMAL;
  ELSE
    NEW.accuracy = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_session_accuracy_trigger
  BEFORE INSERT OR UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_accuracy();

-- ============================================
-- Views for Analytics (Optional)
-- ============================================

-- View: Top players by region/difficulty
CREATE OR REPLACE VIEW leaderboard_top_100 AS
SELECT
  region,
  difficulty,
  display_name,
  score,
  completion_time,
  accuracy,
  achieved_at,
  ROW_NUMBER() OVER (
    PARTITION BY region, difficulty
    ORDER BY score DESC, completion_time ASC
  ) as rank
FROM leaderboard
ORDER BY region, difficulty, rank
LIMIT 100;

COMMENT ON VIEW leaderboard_top_100 IS 'Top 100 leaderboard entries per region/difficulty';

-- View: User statistics summary
CREATE OR REPLACE VIEW user_stats_summary AS
SELECT
  user_id,
  total_games_played,
  best_score,
  ROUND(average_accuracy * 100, 2) as accuracy_percentage,
  ROUND(total_play_time / 1000.0 / 60.0, 2) as total_play_time_minutes,
  perfect_placements,
  longest_streak,
  array_length(counties_learned, 1) as counties_learned_count
FROM game_stats;

COMMENT ON VIEW user_stats_summary IS 'User-friendly statistics summary';

-- ============================================
-- Grant Permissions
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON game_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON game_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON game_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON achievements TO authenticated;
GRANT SELECT, INSERT ON leaderboard TO authenticated;
GRANT SELECT ON leaderboard TO anon;

-- Grant view permissions
GRANT SELECT ON leaderboard_top_100 TO anon, authenticated;
GRANT SELECT ON user_stats_summary TO authenticated;

-- ============================================
-- Migration Complete
-- ============================================

-- Insert migration record
INSERT INTO public.schema_migrations (version)
VALUES ('001_initial_schema')
ON CONFLICT (version) DO NOTHING;

COMMENT ON SCHEMA public IS 'California Counties Puzzle Game - Initial Schema v1.0.0';
