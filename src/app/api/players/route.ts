import { NextRequest, NextResponse } from 'next/server';
import { Player } from '@/types/player';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stat = searchParams.get('stat');
    const limit = searchParams.get('limit');
    const position = searchParams.get('position');

    // Get data from the new API endpoint
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'https://your-domain.com'
      : 'http://localhost:3002';
    
    const hornetsResponse = await fetch(`${baseUrl}/api/hornets-stats`);
    
    if (!hornetsResponse.ok) {
      throw new Error('Failed to fetch Hornets data');
    }
    
    const hornetsData = await hornetsResponse.json();
    let processedPlayers: Player[] = [...hornetsData.players];

    // Filter by position if specified
    if (position && position !== 'all') {
      processedPlayers = processedPlayers.filter(player => 
        player.position.toLowerCase() === position.toLowerCase()
      );
    }

    // Sort by specific stat if provided
    if (stat) {
      const validStats = ['pointsPerGame', 'rebounds', 'assists', 'fieldGoalPercentage', 'threePointPercentage', 'minutesPlayed'] as const;
      
      if (validStats.includes(stat as typeof validStats[number])) {
        processedPlayers.sort((a, b) => b[stat as keyof Player] as number - (a[stat as keyof Player] as number));
      }
    }

    // Limit results if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        processedPlayers = processedPlayers.slice(0, limitNum);
      }
    }

    // Add computed stats
    const enhancedPlayers = processedPlayers.map(player => ({
      ...player,
      totalPoints: player.pointsPerGame * player.gamesPlayed,
      totalRebounds: player.rebounds * player.gamesPlayed,
      totalAssists: player.assists * player.gamesPlayed,
      totalMinutes: player.minutesPlayed * player.gamesPlayed,
      efficiency: calculatePlayerEfficiency(player),
      usageRate: calculateUsageRate(player),
    }));

    // Add team statistics
    const teamStats = calculateTeamStats(hornetsData.players);

    return NextResponse.json({
      players: enhancedPlayers,
      teamStats,
      filters: {
        stat,
        limit: limit ? parseInt(limit) : null,
        position
      },
      count: enhancedPlayers.length,
      totalPlayers: hornetsData.players.length,
      lastUpdated: hornetsData.lastUpdated,
      source: hornetsData.source
    });

  } catch (error) {
    console.error('Error processing players data:', error);
    return NextResponse.json(
      { error: 'Failed to process players data' },
      { status: 500 }
    );
  }
}

// Calculate Player Efficiency Rating (simplified version)
function calculatePlayerEfficiency(player: Player): number {
  const pointsPerGame = player.pointsPerGame;
  const rebounds = player.rebounds;
  const assists = player.assists;
  const fgPct = player.fieldGoalPercentage / 100;
  const threePct = player.threePointPercentage / 100;
  const minutesPlayed = player.minutesPlayed;

  // Simplified PER calculation
  const per = (pointsPerGame + rebounds + assists + (fgPct * 10) + (threePct * 5)) / (minutesPlayed / 30);
  
  return Math.round(per * 100) / 100;
}

// Calculate usage rate (simplified)
function calculateUsageRate(player: Player): number {
  const baseUsage = (player.pointsPerGame + player.assists * 0.5) / player.minutesPlayed;
  return Math.round(baseUsage * 1000) / 10; // Return as percentage
}

// Calculate team-wide statistics
function calculateTeamStats(players: Player[]) {
  const totalGamesPlayed = players.reduce((sum, p) => sum + p.gamesPlayed, 0);
  const avgGamesPlayed = totalGamesPlayed / players.length;

  return {
    totalPlayers: players.length,
    averageStats: {
      pointsPerGame: Math.round((players.reduce((sum, p) => sum + p.pointsPerGame, 0) / players.length) * 10) / 10,
      rebounds: Math.round((players.reduce((sum, p) => sum + p.rebounds, 0) / players.length) * 10) / 10,
      assists: Math.round((players.reduce((sum, p) => sum + p.assists, 0) / players.length) * 10) / 10,
      fieldGoalPercentage: Math.round((players.reduce((sum, p) => sum + p.fieldGoalPercentage, 0) / players.length) * 10) / 10,
      threePointPercentage: Math.round((players.reduce((sum, p) => sum + p.threePointPercentage, 0) / players.length) * 10) / 10,
      minutesPlayed: Math.round((players.reduce((sum, p) => sum + p.minutesPlayed, 0) / players.length) * 10) / 10,
      gamesPlayed: Math.round(avgGamesPlayed * 10) / 10
    },
    topPerformers: {
      scoring: players.reduce((prev, current) => prev.pointsPerGame > current.pointsPerGame ? prev : current),
      rebounding: players.reduce((prev, current) => prev.rebounds > current.rebounds ? prev : current),
      assists: players.reduce((prev, current) => prev.assists > current.assists ? prev : current),
      fieldGoal: players.reduce((prev, current) => prev.fieldGoalPercentage > current.fieldGoalPercentage ? prev : current),
      threePoint: players.reduce((prev, current) => prev.threePointPercentage > current.threePointPercentage ? prev : current)
    },
    positionBreakdown: calculatePositionBreakdown(players)
  };
}

function calculatePositionBreakdown(players: Player[]) {
  const breakdown: Record<string, number> = {};
  
  players.forEach(player => {
    breakdown[player.position] = (breakdown[player.position] || 0) + 1;
  });

  return breakdown;
}