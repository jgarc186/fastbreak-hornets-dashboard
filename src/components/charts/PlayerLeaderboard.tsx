"use client";

import { Player } from "@/types/player";

interface PlayerLeaderboardProps {
  players: Player[];
}

type StatCategory = 'pointsPerGame' | 'rebounds' | 'assists' | 'fieldGoalPercentage' | 'threePointPercentage';

const statCategories: { key: StatCategory; label: string; format: (val: number) => string }[] = [
  { key: 'pointsPerGame', label: 'Points Per Game', format: (val) => val.toFixed(1) },
  { key: 'rebounds', label: 'Rebounds', format: (val) => val.toFixed(1) },
  { key: 'assists', label: 'Assists', format: (val) => val.toFixed(1) },
  { key: 'fieldGoalPercentage', label: 'Field Goal %', format: (val) => `${val.toFixed(1)}%` },
  { key: 'threePointPercentage', label: '3-Point %', format: (val) => `${val.toFixed(1)}%` },
];

export default function PlayerLeaderboard({ players }: PlayerLeaderboardProps) {
  const getTopPlayers = (statKey: StatCategory, count: number = 5) => {
    return [...players]
      .sort((a, b) => b[statKey] - a[statKey])
      .slice(0, count);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Player Leaderboards</h2>
      
      <div className="space-y-6">
        {statCategories.map((category) => {
          const topPlayers = getTopPlayers(category.key);
          
          return (
            <div key={category.key} className="border-b border-gray-200 pb-4 last:border-b-0">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{category.label}</h3>
              
              <div className="space-y-2">
                {topPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium text-gray-900">{player.name}</span>
                        <span className="text-gray-500 text-sm ml-2">({player.position})</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {category.format(player[category.key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}