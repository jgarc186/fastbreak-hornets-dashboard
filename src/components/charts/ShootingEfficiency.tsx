"use client";

import { Player } from "@/types/player";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ShootingEfficiencyProps {
  players: Player[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function ShootingEfficiency({ players, loading = false, error, onRetry }: ShootingEfficiencyProps) {
  const chartData = players.map(player => ({
    name: player.name.split(' ').pop(), // Last name only for space
    fieldGoal: player.fieldGoalPercentage,
    threePoint: player.threePointPercentage,
    fullName: player.name,
    position: player.position
  }));

  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{payload: {
      fieldGoal: number;
      threePoint: number;
      fullName: string;
      position: string;
    }}>; 
    label?: string 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="stats-card p-3">
          <p className="font-semibold text-hornets-purple">{data.fullName}</p>
          <p className="text-hornets-teal text-sm mb-2">{data.position}</p>
          <p className="text-hornets-teal">
            Field Goal: <span className="font-semibold">{data.fieldGoal.toFixed(1)}%</span>
          </p>
          <p className="text-hornets-purple">
            3-Point: <span className="font-semibold">{data.threePoint.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLoadingSkeleton = () => (
    <div className="h-80 bg-hornets-light-teal bg-opacity-10 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-hornets-light-teal bg-opacity-30 rounded w-32 mb-2 mx-auto"></div>
          <div className="h-3 bg-hornets-light-teal bg-opacity-20 rounded w-24 mx-auto"></div>
        </div>
        <p className="text-hornets-teal mt-4">Loading shooting data...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="h-80 border-2 border-dashed border-red-200 bg-red-50 rounded flex items-center justify-center">
      <div className="text-center">
        <div className="text-hornets-purple font-semibold mb-2">
          Unable to load shooting efficiency data
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
        <div className="font-semibold mb-2">No shooting data available</div>
        <p className="text-sm">Check back later for updated stats</p>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="stats-number text-hornets-purple mb-6">Shooting Efficiency Comparison</h2>
      
      {loading ? (
        renderLoadingSkeleton()
      ) : error && players.length === 0 ? (
        renderErrorState()
      ) : players.length === 0 ? (
        renderEmptyState()
      ) : (
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
                domain={[0, 60]}
                tickFormatter={(value) => `${value}%`}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="fieldGoal" 
                name="Field Goal %" 
                fill="var(--hornets-teal)" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="threePoint" 
                name="3-Point %" 
                fill="var(--hornets-purple)" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="mt-4 text-sm text-hornets-teal">
        <p>Compare field goal percentage vs 3-point percentage for all players</p>
      </div>
    </div>
  );
}