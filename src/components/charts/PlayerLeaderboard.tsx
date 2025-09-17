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
    <div>
      <h2 className="stats-number text-hornets-purple mb-6">Player Leaderboards</h2>
      
      <div className="space-y-6">
        {statCategories.map((category) => {
          const topPlayers = getTopPlayers(category.key);
          
          return (
            <div key={category.key} className="border-b border-hornets-light-teal pb-4 last:border-b-0">
              <h3 className="text-lg font-semibold text-hornets-teal mb-3">{category.label}</h3>
              
              <div className="space-y-2">
                {topPlayers.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-hornets-light-teal hover:bg-opacity-10 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-hornets-teal text-white text-sm font-semibold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium text-foreground">{player.name}</span>
                        <span className="text-hornets-teal text-sm ml-2">({player.position})</span>
                      </div>
                    </div>
                    <span className="stats-number text-hornets-purple text-lg">
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