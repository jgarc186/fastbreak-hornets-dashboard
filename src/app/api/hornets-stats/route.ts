import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { transformSupabaseViewToPlayer } from '@/lib/supabaseTransforms';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching Hornets data from Supabase view...');
    
    // Get sorting parameters from query string
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sort') || 'points_per_game';
    const order = searchParams.get('order') || 'desc';
    
    // Valid sortable columns to prevent SQL injection
    const validSortColumns = [
      'points_per_game', 'rebounds_per_game', 'assists_per_game', 
      'field_goal_percentage', 'three_point_percentage', 'minutes_per_game',
      'games_played', 'name', 'position'
    ];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'points_per_game';
    const ascending = order === 'asc';
    
    // Use the flattened view to avoid PGRST100 ordering error
    const { data: playersData, error } = await supabase
      .from('hornets_current_stats')
      .select('*')
      .order(sortColumn, { ascending });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: "Failed to fetch player data from database." },
        { status: 500 }
      );
    }

    if (!playersData || playersData.length === 0) {
      return NextResponse.json(
        { 
          error: "No player data found. Data may need to be synced.",
          suggestion: "Try running /api/sync-hornets-data to populate the database."
        },
        { status: 404 }
      );
    }

    // Transform flattened view data to match existing Player interface
    const transformedPlayers = playersData.map(transformSupabaseViewToPlayer);

    console.log(`Successfully fetched ${transformedPlayers.length} players from Supabase view`);

    // Get the most recent sync time for data freshness info
    const { data: lastSync } = await supabase
      .from('data_sync_log')
      .select('completed_at, status')
      .eq('sync_type', 'stats')
      .eq('status', 'success')
      .order('completed_at', { ascending: false })
      .limit(1);

    const lastUpdated = lastSync && lastSync.length > 0 ? lastSync[0].completed_at : null;

    return NextResponse.json({
      players: transformedPlayers,
      lastUpdated: lastUpdated || new Date().toISOString(),
      source: "Supabase Cache",
      season: 2024,
      isCached: true,
      sortedBy: sortColumn,
      sortOrder: order
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800'
        // Cache for 5 minutes, serve stale for 30 minutes while revalidating
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching Hornets stats from Supabase:', error);
    
    return NextResponse.json(
      { error: "Failed to fetch player stats. Please try again later." },
      { status: 500 }
    );
  }
}