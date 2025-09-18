-- Supabase Database Schema for Charlotte Hornets Dashboard
-- Run this script in the Supabase SQL Editor

-- Table 1: hornets_players
CREATE TABLE hornets_players (
  id SERIAL PRIMARY KEY,
  api_player_id INTEGER UNIQUE NOT NULL, -- Ball Don't Lie player ID
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  height_feet INTEGER,
  height_inches INTEGER,
  weight_pounds INTEGER,
  team_id INTEGER NOT NULL DEFAULT 4, -- Charlotte Hornets
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: player_season_stats
CREATE TABLE player_season_stats (
  id SERIAL PRIMARY KEY,
  api_player_id INTEGER REFERENCES hornets_players(api_player_id),
  season INTEGER NOT NULL,
  games_played INTEGER,
  minutes_per_game DECIMAL(4,1), -- Converted from "MM:SS" to decimal
  points_per_game DECIMAL(4,1),
  rebounds_per_game DECIMAL(4,1),
  assists_per_game DECIMAL(4,1),
  steals_per_game DECIMAL(4,1),
  blocks_per_game DECIMAL(4,1),
  turnovers_per_game DECIMAL(4,1),
  field_goal_percentage DECIMAL(5,1), -- Stored as percentage (43.5)
  three_point_percentage DECIMAL(5,1), -- Stored as percentage (37.1)
  free_throw_percentage DECIMAL(5,1), -- Stored as percentage (85.2)
  field_goals_made DECIMAL(4,1),
  field_goals_attempted DECIMAL(4,1),
  three_pointers_made DECIMAL(4,1),
  three_pointers_attempted DECIMAL(4,1),
  free_throws_made DECIMAL(4,1),
  free_throws_attempted DECIMAL(4,1),
  offensive_rebounds DECIMAL(4,1),
  defensive_rebounds DECIMAL(4,1),
  personal_fouls DECIMAL(4,1),
  last_api_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_player_id, season)
);

-- Table 3: data_sync_log
CREATE TABLE data_sync_log (
  id SERIAL PRIMARY KEY,
  sync_type TEXT NOT NULL, -- 'players' or 'stats'
  season INTEGER,
  status TEXT NOT NULL, -- 'success', 'partial', 'failed'
  players_synced INTEGER DEFAULT 0,
  errors_encountered INTEGER DEFAULT 0,
  api_calls_made INTEGER DEFAULT 0,
  sync_duration_seconds INTEGER,
  error_details JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_hornets_players_api_id ON hornets_players(api_player_id);
CREATE INDEX idx_hornets_players_active ON hornets_players(is_active);
CREATE INDEX idx_player_season_stats_player_season ON player_season_stats(api_player_id, season);
CREATE INDEX idx_player_season_stats_season ON player_season_stats(season);
CREATE INDEX idx_data_sync_log_type_status ON data_sync_log(sync_type, status);
CREATE INDEX idx_data_sync_log_completed ON data_sync_log(completed_at DESC);

-- Row Level Security (RLS) - Enable public read access for dashboard
ALTER TABLE hornets_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access to players and stats (for dashboard users)
CREATE POLICY "Allow public read access to players" ON hornets_players 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to stats" ON player_season_stats 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to sync logs" ON data_sync_log 
  FOR SELECT USING (true);

-- Trigger to automatically update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hornets_players_updated_at 
  BEFORE UPDATE ON hornets_players 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for easy querying of players with their current season stats
CREATE VIEW current_hornets_roster AS
SELECT 
  p.*,
  s.points_per_game,
  s.rebounds_per_game,
  s.assists_per_game,
  s.field_goal_percentage,
  s.three_point_percentage,
  s.minutes_per_game,
  s.games_played,
  s.last_api_update
FROM hornets_players p
LEFT JOIN player_season_stats s ON p.api_player_id = s.api_player_id AND s.season = 2024
WHERE p.is_active = true
ORDER BY s.points_per_game DESC NULLS LAST;

-- Grant permissions for the view
GRANT SELECT ON current_hornets_roster TO PUBLIC;
