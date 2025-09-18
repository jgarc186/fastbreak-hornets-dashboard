import { NextResponse } from 'next/server';
import axios from 'axios';
import { 
  transformApiDataToPlayer, 
  type ApiPlayer, 
  type ApiPlayerStats 
} from '@/lib/apiTransforms';

const BALLDONTLIE_API_BASE = 'https://api.balldontlie.io/v1';
const HORNETS_TEAM_ID = 4;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const apiKey = process.env.BALLDONTLIE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Please add BALLDONTLIE_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    // Step 1: Get current Hornets roster
    console.log('Fetching Hornets roster...');
    const playersResponse = await axios.get(
      `${BALLDONTLIE_API_BASE}/players?team_ids[]=${HORNETS_TEAM_ID}&per_page=100`,
      { headers }
    );

    const players = playersResponse.data.data;
    console.log(`Found ${players.length} Hornets players`);

    // Step 2: Get season averages for each player (2024 season)
    const currentSeason = 2024;
    const statsPromises = [];
    
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      
      // Add delay between requests to respect rate limits
      if (i > 0) {
        await delay(100); // 100ms delay between requests
      }
      
      const statsPromise = axios.get(
        `${BALLDONTLIE_API_BASE}/season_averages?player_id=${player.id}&season=${currentSeason}`,
        { headers }
      ).then(response => response.data.data[0]).catch(error => {
        console.warn(`Failed to fetch stats for player ${player.id}:`, error.message);
        return null;
      });
      
      statsPromises.push(statsPromise);
    }

    console.log('Fetching season averages for all players...');
    const allStats = await Promise.all(statsPromises);
    const validStats = allStats.filter(Boolean);
    
    console.log(`Successfully fetched stats for ${validStats.length} players`);

    // Step 3: Transform data to match existing Player interface
    const transformedPlayers = transformApiDataToPlayer(players, validStats);
    
    // Step 4: Sort by points per game and return top performers
    const sortedPlayers = transformedPlayers.sort((a, b) => b.pointsPerGame - a.pointsPerGame);

    console.log(`Returning ${sortedPlayers.length} players with stats`);

    return NextResponse.json({
      players: sortedPlayers,
      lastUpdated: new Date().toISOString(),
      source: "Ball Don't Lie API",
      season: currentSeason
    });

  } catch (error: unknown) {
    console.error('Error fetching Hornets stats:', error);
    
    // Handle different types of errors
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { status: number } };
      
      if (axiosError.response?.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your BALLDONTLIE_API_KEY." },
          { status: 401 }
        );
      }
      
      if (axiosError.response?.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to fetch player stats. Please try again later." },
      { status: 500 }
    );
  }
}