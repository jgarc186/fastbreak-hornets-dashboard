"use client";

import { charlotteHornetsPlayers } from "@/lib/mockData";
import PlayerLeaderboard from "./charts/PlayerLeaderboard";
import ShootingEfficiency from "./charts/ShootingEfficiency";
import PointsDistribution from "./charts/PointsDistribution";
import PerformanceRadarChart from "./charts/PerformanceRadarChart";

interface DashboardContentProps {
  user: {
    name?: string;
    email?: string;
  };
}

export default function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Charlotte Hornets Player Insights
            </h1>
            <p className="text-gray-600">Welcome back, {user.name || user.email || 'User'}</p>
          </div>

          <a
            href="/auth/logout"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Logout
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlayerLeaderboard players={charlotteHornetsPlayers} />
          <ShootingEfficiency players={charlotteHornetsPlayers} />
          <PointsDistribution players={charlotteHornetsPlayers} />
          <PerformanceRadarChart players={charlotteHornetsPlayers} />
        </div>
      </div>
    </div>
  );
}
