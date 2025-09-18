"use client";

import { Player } from "@/types/player";

interface PlayerLeaderboardProps {
  players: Player[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

type StatCategory = 'pointsPerGame' | 'rebounds' | 'assists' | 'fieldGoalPercentage' | 'threePointPercentage';

const statCategories: { key: StatCategory; label: string; format: (val: number) => string }[] = [
  { key: 'pointsPerGame', label: 'Points Per Game', format: (val) => val.toFixed(1) },
  { key: 'rebounds', label: 'Rebounds', format: (val) => val.toFixed(1) },
  { key: 'assists', label: 'Assists', format: (val) => val.toFixed(1) },
  { key: 'fieldGoalPercentage', label: 'Field Goal %', format: (val) => `${val.toFixed(1)}%` },
  { key: 'threePointPercentage', label: '3-Point %', format: (val) => `${val.toFixed(1)}%` },
];

export default function PlayerLeaderboard({ players, loading = false, error, onRetry }: PlayerLeaderboardProps) {
  const getTopPlayers = (statKey: StatCategory, count: number = 5) => {
    return [...players]
      .sort((a, b) => b[statKey] - a[statKey])
      .slice(0, count);
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      {statCategories.map((category) => (
        <div key={category.key} className="border-b border-hornets-light-teal pb-4 last:border-b-0">
          <div className="h-6 bg-hornets-light-teal bg-opacity-20 rounded mb-3 w-32 animate-pulse"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-hornets-light-teal bg-opacity-30 rounded-full animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-hornets-light-teal bg-opacity-20 rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-hornets-light-teal bg-opacity-15 rounded w-8 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-5 bg-hornets-light-teal bg-opacity-20 rounded w-12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="text-hornets-purple font-semibold mb-2">
        Unable to load leaderboard data
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
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="text-hornets-purple font-semibold mb-2">
        No player data available
      </div>
      <p className="text-hornets-teal text-sm">
        Check back later for updated stats
      </p>
    </div>
  );

  return (
    <div>
      <h2 className="stats-number text-hornets-purple mb-6">Player Leaderboards</h2>
      
      {loading ? (
        renderLoadingSkeleton()
      ) : error && players.length === 0 ? (
        renderErrorState()
      ) : players.length === 0 ? (
        renderEmptyState()
      ) : (
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
                          <span className="font-medium text-hornets-purple">{player.name}</span>
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
      )}
    </div>
  );
}
