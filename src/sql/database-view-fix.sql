-- Database View Fix for PGRST100 Error
-- Run this in your Supabase SQL Editor to fix ordering issues

-- Create flattened view to fix PGRST100 ordering error
CREATE OR REPLACE VIEW hornets_current_stats AS
SELECT 
  -- Player information
  hp.api_player_id as id,
  hp.full_name as name,
  hp.position,
  hp.first_name,
  hp.last_name,
  hp.height_feet,
  hp.height_inches,
  hp.weight_pounds,
  hp.is_active,
  
  -- Season statistics  
  pss.season,
  pss.games_played,
  pss.minutes_per_game,
  pss.points_per_game,
  pss.rebounds_per_game,
  pss.assists_per_game,
  pss.steals_per_game,
  pss.blocks_per_game,
  pss.turnovers_per_game,
  pss.field_goal_percentage,
  pss.three_point_percentage,
  pss.free_throw_percentage,
  pss.field_goals_made,
  pss.field_goals_attempted,
  pss.three_pointers_made,
  pss.three_pointers_attempted,
  pss.free_throws_made,
  pss.free_throws_attempted,
  pss.offensive_rebounds,
  pss.defensive_rebounds,
  pss.personal_fouls,
  pss.last_api_update,
  
  -- Computed fields for easy access
  hp.created_at as player_created_at,
  pss.created_at as stats_created_at

FROM hornets_players hp
INNER JOIN player_season_stats pss ON hp.api_player_id = pss.api_player_id
WHERE hp.is_active = true AND pss.season = 2024;

-- Grant permissions for the view
GRANT SELECT ON hornets_current_stats TO PUBLIC;

-- Test the view (optional - remove this comment and run to test)
-- SELECT * FROM hornets_current_stats ORDER BY points_per_game DESC LIMIT 5;
