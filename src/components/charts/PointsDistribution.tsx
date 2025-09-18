"use client";

import { Player } from "@/types/player";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PointsDistributionProps {
  players: Player[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function PointsDistribution({ players, loading = false, error, onRetry }: PointsDistributionProps) {
  const chartData = players
    .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
    .map(player => ({
      name: player.name.split(' ').pop(), // Last name only for space
      points: player.pointsPerGame,
      fullName: player.name,
      position: player.position,
      gamesPlayed: player.gamesPlayed
    }));

  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{payload: {
      points: number;
      fullName: string;
      position: string;
      gamesPlayed: number;
    }}>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="stats-card p-3">
          <p className="font-semibold text-hornets-purple">{data.fullName}</p>
          <p className="text-hornets-teal text-sm">{data.position}</p>
          <p className="text-hornets-purple">
            PPG: <span className="font-semibold">{data.points.toFixed(1)}</span>
          </p>
          <p className="text-hornets-teal text-sm">
            Games: {data.gamesPlayed}
          </p>
        </div>
      );
    }
    return null;
  };

  const maxPoints = players.length > 0 ? Math.max(...players.map(p => p.pointsPerGame)) : 0;
  const yAxisMax = Math.ceil(maxPoints / 5) * 5; // Round up to nearest 5

  const renderLoadingSkeleton = () => (
    <div className="h-80 bg-hornets-light-teal bg-opacity-10 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-hornets-light-teal bg-opacity-30 rounded w-32 mb-2 mx-auto"></div>
          <div className="h-3 bg-hornets-light-teal bg-opacity-20 rounded w-24 mx-auto"></div>
        </div>
        <p className="text-hornets-teal mt-4">Loading scoring data...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="h-80 border-2 border-dashed border-red-200 bg-red-50 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="text-hornets-purple font-semibold mb-2">
          Unable to load points distribution data
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
        <div className="font-semibold mb-2">No scoring data available</div>
        <p className="text-sm">Check back later for updated stats</p>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="stats-number text-hornets-purple mb-6">Points Per Game Distribution</h2>
      
      {loading ? (
        renderLoadingSkeleton()
      ) : error && players.length === 0 ? (
        renderErrorState()
      ) : players.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  className="text-xs"
                />
                <YAxis 
                  domain={[0, yAxisMax]}
                  tickFormatter={(value) => value.toString()}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="points" 
                  fill="var(--hornets-teal)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm text-hornets-teal">
            <p>Players ranked by scoring average</p>
            <div className="flex items-center space-x-4">
              <span className="stats-number text-sm">Avg: {(players.reduce((sum, p) => sum + p.pointsPerGame, 0) / players.length).toFixed(1)} PPG</span>
              <span className="stats-number text-sm">High: {maxPoints.toFixed(1)} PPG</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}