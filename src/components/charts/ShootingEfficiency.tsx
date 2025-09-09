"use client";

import { Player } from "@/types/player";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ShootingEfficiencyProps {
  players: Player[];
}

export default function ShootingEfficiency({ players }: ShootingEfficiencyProps) {
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.fullName}</p>
          <p className="text-gray-600 text-sm mb-2">{data.position}</p>
          <p className="text-blue-600">
            Field Goal: <span className="font-semibold">{data.fieldGoal.toFixed(1)}%</span>
          </p>
          <p className="text-green-600">
            3-Point: <span className="font-semibold">{data.threePoint.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Shooting Efficiency Comparison</h2>
      
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
              fill="#3b82f6" 
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="threePoint" 
              name="3-Point %" 
              fill="#10b981" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Compare field goal percentage vs 3-point percentage for all players</p>
      </div>
    </div>
  );
}