import { Player } from '@/types/player';
import { HornetsPlayer, PlayerSeasonStats, PlayerWithStats, HornetsCurrentStatsView } from './supabase';
import { ApiPlayer, ApiPlayerStats, parseMinutesToDecimal, PLAYER_POSITIONS } from './apiTransforms';

/**
 * Transform Supabase data to match the existing Player interface
 * Used when fetching data from Supabase to display in the dashboard
 */
export function transformSupabaseToPlayer(supabaseData: PlayerWithStats): Player {
  const stats = supabaseData.player_season_stats[0];
  
  if (!stats) {
    // Handle players without stats gracefully
    return {
      id: supabaseData.api_player_id,
      name: supabaseData.full_name,
      position: supabaseData.position || 'N/A',
      pointsPerGame: 0,
      rebounds: 0,
      assists: 0,
      fieldGoalPercentage: 0,
      threePointPercentage: 0,
      minutesPlayed: 0,
      gamesPlayed: 0
    };
  }

  return {
    id: supabaseData.api_player_id,
    name: supabaseData.full_name,
    position: supabaseData.position || 'N/A',
    pointsPerGame: Number((stats.points_per_game || 0).toFixed(1)),
    rebounds: Number((stats.rebounds_per_game || 0).toFixed(1)),
    assists: Number((stats.assists_per_game || 0).toFixed(1)),
    fieldGoalPercentage: Number((stats.field_goal_percentage || 0).toFixed(1)),
    threePointPercentage: Number((stats.three_point_percentage || 0).toFixed(1)),
    minutesPlayed: Number((stats.minutes_per_game || 0).toFixed(1)),
    gamesPlayed: stats.games_played || 0
  };
}

/**
 * Transform flattened Supabase view data to match the existing Player interface
 * Used with the hornets_current_stats view to avoid PGRST100 ordering errors
 */
export function transformSupabaseViewToPlayer(viewData: HornetsCurrentStatsView): Player {
  return {
    id: viewData.id,
    name: viewData.name,
    position: viewData.position || 'N/A',
    pointsPerGame: Number((viewData.points_per_game || 0).toFixed(1)),
    rebounds: Number((viewData.rebounds_per_game || 0).toFixed(1)),
    assists: Number((viewData.assists_per_game || 0).toFixed(1)),
    fieldGoalPercentage: Number((viewData.field_goal_percentage || 0).toFixed(1)),
    threePointPercentage: Number((viewData.three_point_percentage || 0).toFixed(1)),
    minutesPlayed: Number((viewData.minutes_per_game || 0).toFixed(1)),
    gamesPlayed: viewData.games_played || 0
  };
}

/**
 * Transform Ball Don't Lie API data to Supabase format
 * Used when syncing data from the external API to our database
 */
export function transformBallDontLieToSupabase(playerData: ApiPlayer, statsData: ApiPlayerStats | null) {
  const playerName = `${playerData.first_name} ${playerData.last_name}`;
  
  // Parse height from string format like "6-8" to feet and inches
  let heightFeet = null;
  let heightInches = null;
  if (playerData.height) {
    const heightMatch = playerData.height.match(/(\d+)-(\d+)/);
    if (heightMatch) {
      heightFeet = parseInt(heightMatch[1]);
      heightInches = parseInt(heightMatch[2]);
    }
  }

  // Parse weight from string format like "240" to number
  let weightPounds = null;
  if (playerData.weight) {
    const weight = parseInt(playerData.weight);
    if (!isNaN(weight)) {
      weightPounds = weight;
    }
  }

  const playerInsert: Omit<HornetsPlayer, 'id' | 'created_at' | 'updated_at'> = {
    api_player_id: playerData.id,
    first_name: playerData.first_name,
    last_name: playerData.last_name,
    full_name: playerName,
    position: PLAYER_POSITIONS[playerName] || null,
    height_feet: heightFeet,
    height_inches: heightInches,
    weight_pounds: weightPounds,
    team_id: 4, // Charlotte Hornets
    is_active: true
  };

  let statsInsert: Omit<PlayerSeasonStats, 'id' | 'created_at'> | null = null;

  if (statsData && statsData.games_played > 0) {
    statsInsert = {
      api_player_id: playerData.id,
      season: 2024,
      games_played: statsData.games_played,
      minutes_per_game: parseMinutesToDecimal(statsData.min),
      points_per_game: statsData.pts,
      rebounds_per_game: statsData.reb,
      assists_per_game: statsData.ast,
      steals_per_game: statsData.stl,
      blocks_per_game: statsData.blk,
      turnovers_per_game: statsData.turnover,
      field_goal_percentage: statsData.fg_pct * 100,
      three_point_percentage: statsData.fg3_pct * 100,
      free_throw_percentage: statsData.ft_pct * 100,
      field_goals_made: statsData.fgm,
      field_goals_attempted: statsData.fga,
      three_pointers_made: statsData.fg3m,
      three_pointers_attempted: statsData.fg3a,
      free_throws_made: statsData.ftm,
      free_throws_attempted: statsData.fta,
      offensive_rebounds: statsData.oreb,
      defensive_rebounds: statsData.dreb,
      personal_fouls: statsData.pf,
      last_api_update: new Date().toISOString()
    };
  }

  return {
    playerInsert,
    statsInsert
  };
}

/**
 * Calculate sync metrics for logging
 */
export function calculateSyncMetrics(
  startTime: Date,
  totalPlayers: number,
  successfulPlayers: number,
  errors: string[],
  apiCalls: number
) {
  const endTime = new Date();
  const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  
  let status: 'success' | 'partial' | 'failed';
  if (successfulPlayers === totalPlayers) {
    status = 'success';
  } else if (successfulPlayers > 0) {
    status = 'partial';
  } else {
    status = 'failed';
  }

  return {
    status,
    players_synced: successfulPlayers,
    errors_encountered: errors.length,
    api_calls_made: apiCalls,
    sync_duration_seconds: durationSeconds,
    error_details: errors.length > 0 ? { errors } : null,
    started_at: startTime.toISOString(),
    completed_at: endTime.toISOString()
  };
}

/**
 * Validate player data before insertion
 */
export function validatePlayerData(playerData: ApiPlayer): boolean {
  return !!(
    playerData.id &&
    playerData.first_name &&
    playerData.last_name &&
    playerData.team?.id === 4 // Must be Charlotte Hornets
  );
}

/**
 * Validate stats data before insertion
 */
export function validateStatsData(statsData: ApiPlayerStats | null): boolean {
  if (!statsData) return false;
  
  return !!(
    statsData.player_id &&
    statsData.games_played > 0 &&
    statsData.season === 2024
  );
}