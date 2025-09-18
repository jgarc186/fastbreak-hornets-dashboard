import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
);

// Database types for better TypeScript support
export interface HornetsPlayer {
  id: number;
  api_player_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  position: string | null;
  height_feet: number | null;
  height_inches: number | null;
  weight_pounds: number | null;
  team_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlayerSeasonStats {
  id: number;
  api_player_id: number;
  season: number;
  games_played: number | null;
  minutes_per_game: number | null;
  points_per_game: number | null;
  rebounds_per_game: number | null;
  assists_per_game: number | null;
  steals_per_game: number | null;
  blocks_per_game: number | null;
  turnovers_per_game: number | null;
  field_goal_percentage: number | null;
  three_point_percentage: number | null;
  free_throw_percentage: number | null;
  field_goals_made: number | null;
  field_goals_attempted: number | null;
  three_pointers_made: number | null;
  three_pointers_attempted: number | null;
  free_throws_made: number | null;
  free_throws_attempted: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  personal_fouls: number | null;
  last_api_update: string;
  created_at: string;
}

export interface DataSyncLog {
  id: number;
  sync_type: 'players' | 'stats';
  season: number | null;
  status: 'success' | 'partial' | 'failed';
  players_synced: number;
  errors_encountered: number;
  api_calls_made: number;
  sync_duration_seconds: number | null;
  error_details: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string;
}

export interface PlayerWithStats extends HornetsPlayer {
  player_season_stats: PlayerSeasonStats[];
}

export interface HornetsCurrentStatsView {
  id: number;
  name: string;
  position: string | null;
  first_name: string;
  last_name: string;
  height_feet: number | null;
  height_inches: number | null;
  weight_pounds: number | null;
  is_active: boolean;
  season: number;
  games_played: number | null;
  minutes_per_game: number | null;
  points_per_game: number | null;
  rebounds_per_game: number | null;
  assists_per_game: number | null;
  steals_per_game: number | null;
  blocks_per_game: number | null;
  turnovers_per_game: number | null;
  field_goal_percentage: number | null;
  three_point_percentage: number | null;
  free_throw_percentage: number | null;
  field_goals_made: number | null;
  field_goals_attempted: number | null;
  three_pointers_made: number | null;
  three_pointers_attempted: number | null;
  free_throws_made: number | null;
  free_throws_attempted: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  personal_fouls: number | null;
  last_api_update: string;
  player_created_at: string;
  stats_created_at: string;
}