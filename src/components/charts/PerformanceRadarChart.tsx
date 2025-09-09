"use client";

import { Player } from "@/types/player";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

interface PerformanceRadarChartProps {
  players: Player[];
}

export default function PerformanceRadarChart({ players }: PerformanceRadarChartProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(players[0]);

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

  const radarData = normalizeStats(selectedPlayer);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Player Performance Radar</h2>
        
        <div className="relative">
          <select
            value={selectedPlayer.id}
            onChange={(e) => {
              const player = players.find(p => p.id === parseInt(e.target.value));
              if (player) setSelectedPlayer(player);
            }}
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.position})
              </option>
            ))}
          </select>
        </div>
      </div>

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
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        {radarData.map((item) => (
          <div key={item.stat} className="text-center">
            <p className="text-gray-600">{item.stat}</p>
            <p className="font-semibold text-gray-900">
              {item.stat.includes('%') 
                ? `${item.fullValue.toFixed(1)}%` 
                : item.fullValue.toFixed(1)}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <p>Performance metrics normalized to 0-100 scale for visual comparison</p>
      </div>
    </div>
  );
}