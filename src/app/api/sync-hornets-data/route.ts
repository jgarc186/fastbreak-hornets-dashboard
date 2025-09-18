import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  transformBallDontLieToSupabase, 
  calculateSyncMetrics, 
  validatePlayerData, 
  validateStatsData 
} from '@/lib/supabaseTransforms';
import { type ApiPlayer, type ApiPlayerStats } from '@/lib/apiTransforms';

const BALLDONTLIE_API_BASE = 'https://api.balldontlie.io/v1';
const HORNETS_TEAM_ID = 4;
const RATE_LIMIT_DELAY = 150; // 150ms between API calls to respect rate limits
const MAX_RETRIES = 3;

// Exponential backoff retry function
async function fetchWithRetry(url: string, headers: Record<string, string>, maxRetries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, { headers });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429 && attempt < maxRetries) {
        // Rate limited, wait with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited, waiting ${delay}ms before retry ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Max retries (${maxRetries}) exceeded`);
}

// Add delay between API calls
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST() {
  const startTime = new Date();
  const errors: string[] = [];
  let totalApiCalls = 0;
  let successfulPlayers = 0;

  try {
    const apiKey = process.env.BALLDONTLIE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Ball Don't Lie API key not configured" },
        { status: 500 }
      );
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    console.log('Starting Hornets data sync...');

    // Step 1: Fetch all Hornets players from Ball Don't Lie API
    console.log('Fetching Hornets roster...');
    const playersResponse = await fetchWithRetry(
      `${BALLDONTLIE_API_BASE}/players?team_ids[]=${HORNETS_TEAM_ID}&per_page=100`,
      headers
    );
    totalApiCalls++;

    if (!playersResponse) {
      throw new Error('Failed to fetch players data');
    }

    const players: ApiPlayer[] = playersResponse.data.data;
    console.log(`Found ${players.length} Hornets players`);

    // Step 2: Process each player
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      
      try {
        // Validate player data
        if (!validatePlayerData(player)) {
          console.warn(`Invalid player data for ${player.first_name} ${player.last_name}`);
          errors.push(`Invalid player data for ${player.first_name} ${player.last_name}`);
          continue;
        }

        console.log(`Processing player ${i + 1}/${players.length}: ${player.first_name} ${player.last_name}`);

        // Add delay between requests (except for first player)
        if (i > 0) {
          await delay(RATE_LIMIT_DELAY);
        }

        // Fetch season stats for this player
        let statsData: ApiPlayerStats | null = null;
        try {
          const statsResponse = await fetchWithRetry(
            `${BALLDONTLIE_API_BASE}/season_averages?player_id=${player.id}&season=2024`,
            headers
          );
          totalApiCalls++;

          const statsArray = statsResponse.data.data;
          if (statsArray.length > 0 && validateStatsData(statsArray[0])) {
            statsData = statsArray[0];
          }
        } catch (error) {
          console.warn(`Failed to fetch stats for player ${player.id}:`, error);
          errors.push(`Failed to fetch stats for player ${player.id}: ${error}`);
        }

        // Transform data for Supabase
        const { playerInsert, statsInsert } = transformBallDontLieToSupabase(player, statsData);

        // Upsert player data
        const { error: playerError } = await supabaseAdmin
          .from('hornets_players')
          .upsert(playerInsert, {
            onConflict: 'api_player_id'
          });

        if (playerError) {
          console.error(`Failed to upsert player ${player.first_name} ${player.last_name}:`, playerError);
          errors.push(`Failed to upsert player ${player.first_name} ${player.last_name}: ${playerError.message}`);
          continue;
        }

        // Upsert stats data if available
        if (statsInsert) {
          const { error: statsError } = await supabaseAdmin
            .from('player_season_stats')
            .upsert(statsInsert, {
              onConflict: 'api_player_id,season'
            });

          if (statsError) {
            console.error(`Failed to upsert stats for player ${player.first_name} ${player.last_name}:`, statsError);
            errors.push(`Failed to upsert stats for player ${player.first_name} ${player.last_name}: ${statsError.message}`);
          }
        }

        successfulPlayers++;
        console.log(`✓ Successfully processed ${player.first_name} ${player.last_name}`);

      } catch (error) {
        console.error(`Error processing player ${player.first_name} ${player.last_name}:`, error);
        errors.push(`Error processing player ${player.first_name} ${player.last_name}: ${error}`);
      }
    }

    // Step 3: Log sync results
    const syncMetrics = calculateSyncMetrics(startTime, players.length, successfulPlayers, errors, totalApiCalls);
    
    const { error: logError } = await supabaseAdmin
      .from('data_sync_log')
      .insert({
        sync_type: 'stats',
        season: 2024,
        status: syncMetrics.status,
        players_synced: syncMetrics.players_synced,
        errors_encountered: syncMetrics.errors_encountered,
        api_calls_made: syncMetrics.api_calls_made,
        sync_duration_seconds: syncMetrics.sync_duration_seconds,
        error_details: syncMetrics.error_details,
        started_at: syncMetrics.started_at,
        completed_at: syncMetrics.completed_at
      });

    if (logError) {
      console.error('Failed to log sync results:', logError);
    }

    console.log('Sync completed!');
    console.log(`Status: ${syncMetrics.status}`);
    console.log(`Players synced: ${successfulPlayers}/${players.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Duration: ${syncMetrics.sync_duration_seconds} seconds`);

    return NextResponse.json({
      success: true,
      message: 'Hornets data sync completed',
      summary: {
        status: syncMetrics.status,
        totalPlayers: players.length,
        playersSync: successfulPlayers,
        errorsEncountered: errors.length,
        apiCalls: totalApiCalls,
        durationSeconds: syncMetrics.sync_duration_seconds
      },
      errors: errors.slice(0, 10), // Limit error details in response
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Sync process failed:', error);
    
    // Log the failed sync attempt
    try {
      const syncMetrics = calculateSyncMetrics(startTime, 0, successfulPlayers, errors, totalApiCalls);
      await supabaseAdmin
        .from('data_sync_log')
        .insert({
          sync_type: 'stats',
          season: 2024,
          status: 'failed',
          players_synced: successfulPlayers,
          errors_encountered: errors.length + 1,
          api_calls_made: totalApiCalls,
          sync_duration_seconds: syncMetrics.sync_duration_seconds,
          error_details: { 
            ...syncMetrics.error_details, 
            criticalError: error instanceof Error ? error.message : 'Unknown error' 
          },
          started_at: syncMetrics.started_at,
          completed_at: syncMetrics.completed_at
        });
    } catch (logError) {
      console.error('Failed to log failed sync:', logError);
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Sync failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// GET method to check sync status and recent logs
export async function GET() {
  try {
    const { data: recentSyncs, error } = await supabaseAdmin
      .from('data_sync_log')
      .select('*')
      .eq('sync_type', 'stats')
      .order('completed_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      recentSyncs,
      lastSyncTime: recentSyncs.length > 0 ? recentSyncs[0].completed_at : null,
      lastSyncStatus: recentSyncs.length > 0 ? recentSyncs[0].status : null
    });

  } catch (error) {
    console.error('Failed to fetch sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}