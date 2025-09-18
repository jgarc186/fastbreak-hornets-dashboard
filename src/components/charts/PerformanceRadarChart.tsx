"use client";

import { Player } from "@/types/player";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface PerformanceRadarChartProps {
  players: Player[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function PerformanceRadarChart({ players, loading = false, error, onRetry }: PerformanceRadarChartProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(players.length > 0 ? players[0] : null);

  // Normalize stats to 0-100 scale for radar chart
  const normalizeStats = (player: Player) => {
    // Find max values for normalization
    const maxPoints = Math.max(...players.map(p => p.pointsPerGame));
    const maxRebounds = Math.max(...players.map(p => p.rebounds));
    const maxAssists = Math.max(...players.map(p => p.assists));
    const maxMinutes = Math.max(...players.map(p => p.minutesPlayed));
    
    return [
      {
        stat: 'Points',
        value: Math.round((player.pointsPerGame / maxPoints) * 100),
        fullValue: player.pointsPerGame
      },
      {
        stat: 'Rebounds',
        value: Math.round((player.rebounds / maxRebounds) * 100),
        fullValue: player.rebounds
      },
      {
        stat: 'Assists',
        value: Math.round((player.assists / maxAssists) * 100),
        fullValue: player.assists
      },
      {
        stat: 'FG%',
        value: Math.round((player.fieldGoalPercentage / 60) * 100), // Assuming max reasonable FG% is 60%
        fullValue: player.fieldGoalPercentage
      },
      {
        stat: '3P%',
        value: Math.round((player.threePointPercentage / 50) * 100), // Assuming max reasonable 3P% is 50%
        fullValue: player.threePointPercentage
      },
      {
        stat: 'Minutes',
        value: Math.round((player.minutesPlayed / maxMinutes) * 100),
        fullValue: player.minutesPlayed
      }
    ];
  };

  const radarData = selectedPlayer ? normalizeStats(selectedPlayer) : [];

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="h-6 bg-hornets-light-teal bg-opacity-20 rounded w-48 mb-4 sm:mb-0 animate-pulse"></div>
        <div className="h-10 bg-hornets-light-teal bg-opacity-20 rounded w-40 animate-pulse"></div>
      </div>
      <div className="h-80 bg-hornets-light-teal bg-opacity-10 rounded flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-hornets-light-teal bg-opacity-30 rounded w-32 mb-2 mx-auto"></div>
            <div className="h-3 bg-hornets-light-teal bg-opacity-20 rounded w-24 mx-auto"></div>
          </div>
          <p className="text-hornets-teal mt-4">Loading performance data...</p>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="h-80 border-2 border-dashed border-red-200 bg-red-50 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="text-hornets-purple font-semibold mb-2">
          Unable to load performance radar data
        </div>
        {error && <p className="text-hornets-teal text-sm mb-4">{error}</p>}
        {onRetry && (
          <button 
            onClick={onRetry}
            className="bg-hornets-teal text-white px-4 py-2 rounded hover:bg-hornets-purple transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="h-80 border-2 border-dashed border-hornets-light-teal border-opacity-30 rounded flex items-center justify-center">
      <div className="text-center text-hornets-teal">
        <div className="font-semibold mb-2">No performance data available</div>
        <p className="text-sm">Check back later for updated stats</p>
      </div>
    </div>
  );

  // Update selected player when players array changes
  if (players.length > 0 && !selectedPlayer) {
    setSelectedPlayer(players[0]);
  } else if (selectedPlayer && !players.find(p => p.id === selectedPlayer.id)) {
    setSelectedPlayer(players.length > 0 ? players[0] : null);
  }

  if (loading) {
    return (
      <div>
        <h2 className="stats-number text-hornets-purple mb-6">Player Performance Radar</h2>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (error && players.length === 0) {
    return (
      <div>
        <h2 className="stats-number text-hornets-purple mb-6">Player Performance Radar</h2>
        {renderErrorState()}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div>
        <h2 className="stats-number text-hornets-purple mb-6">Player Performance Radar</h2>
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="stats-number text-hornets-purple mb-4 sm:mb-0">Player Performance Radar</h2>
        
        <div className="relative">
          <select
            value={selectedPlayer?.id || ''}
            onChange={(e) => {
              const player = players.find(p => p.id === parseInt(e.target.value));
              if (player) setSelectedPlayer(player);
            }}
            className="block w-full px-3 py-2 bg-white border border-hornets-light-teal rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hornets-teal focus:border-hornets-teal"
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.position})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPlayer && (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="stat" 
                  className="text-sm"
                  tick={{ fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  className="text-xs"
                  tick={{ fontSize: 10 }}
                  tickCount={6}
                />
                <Radar
                  name={selectedPlayer.name}
                  dataKey="value"
                  stroke="var(--hornets-teal)"
                  fill="var(--hornets-teal)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--hornets-purple)" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {radarData.map((item) => (
              <div key={item.stat} className="text-center">
                <p className="text-hornets-teal">{item.stat}</p>
                <p className="stats-number text-hornets-purple text-lg">
                  {item.stat.includes('%') 
                    ? `${item.fullValue.toFixed(1)}%` 
                    : item.fullValue.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-hornets-teal">
            <p>Performance metrics normalized to 0-100 scale for visual comparison</p>
          </div>
        </>
      )}
    </div>
  );
}