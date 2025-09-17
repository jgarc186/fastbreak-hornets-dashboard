import { Trophy, Target, TrendingUp, Users } from "lucide-react";
import { SectionType } from "./ui/Sidebar";

interface OverviewSectionProps {
  user: {
    name?: string;
    email?: string;
  };
  onSectionChange?: (section: SectionType) => void;
}

export default function OverviewSection({ user, onSectionChange }: OverviewSectionProps) {
  // Mock data for overview cards
  const overviewStats = [
    {
      title: "Season Record",
      value: "23-59",
      icon: Trophy,
      description: "2023-24 Regular Season",
      color: "text-hornets-purple"
    },
    {
      title: "Team PPG",
      value: "108.2",
      icon: Target,
      description: "Points per game average",
      color: "text-hornets-teal"
    },
    {
      title: "Active Players",
      value: "15",
      icon: Users,
      description: "Current roster size",
      color: "text-hornets-purple"
    },
    {
      title: "Season Progress",
      value: "100%",
      icon: TrendingUp,
      description: "2023-24 season completed",
      color: "text-hornets-teal"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="stats-card p-6 court-pattern">
        <div className="text-center">
          <h2 className="stats-number text-hornets-purple mb-2">
            Welcome to the Hornets Dashboard
          </h2>
          <p className="text-hornets-teal text-lg">
            Hello, {user.name || user.email || 'User'}! 
          </p>
          <p className="text-gray-600 mt-2">
            Explore comprehensive player statistics and team analytics for the Charlotte Hornets.
          </p>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stats-card p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-hornets-light-teal bg-opacity-10 rounded-full flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </h3>
              <p className={`stats-number ${stat.color} mb-2`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation */}
      <div className="stats-card p-6">
        <h3 className="text-lg font-semibold text-hornets-purple mb-4">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => onSectionChange?.('leaderboard')}
            className="p-4 border border-hornets-light-teal rounded-lg hover:bg-hornets-light-teal hover:bg-opacity-5 transition-colors cursor-pointer text-left"
          >
            <h4 className="font-medium text-hornets-purple mb-1">Player Leaderboard</h4>
            <p className="text-sm text-gray-600">View top performers by category</p>
          </button>
          <button 
            onClick={() => onSectionChange?.('shooting')}
            className="p-4 border border-hornets-light-teal rounded-lg hover:bg-hornets-light-teal hover:bg-opacity-5 transition-colors cursor-pointer text-left"
          >
            <h4 className="font-medium text-hornets-purple mb-1">Shooting Analysis</h4>
            <p className="text-sm text-gray-600">Analyze team shooting efficiency</p>
          </button>
          <button 
            onClick={() => onSectionChange?.('distribution')}
            className="p-4 border border-hornets-light-teal rounded-lg hover:bg-hornets-light-teal hover:bg-opacity-5 transition-colors cursor-pointer text-left"
          >
            <h4 className="font-medium text-hornets-purple mb-1">Scoring Distribution</h4>
            <p className="text-sm text-gray-600">Explore points distribution patterns</p>
          </button>
          <button 
            onClick={() => onSectionChange?.('performance')}
            className="p-4 border border-hornets-light-teal rounded-lg hover:bg-hornets-light-teal hover:bg-opacity-5 transition-colors cursor-pointer text-left"
          >
            <h4 className="font-medium text-hornets-purple mb-1">Performance Radar</h4>
            <p className="text-sm text-gray-600">Compare multi-category performance</p>
          </button>
        </div>
      </div>

      {/* Team Info */}
      <div className="stats-card p-6">
        <h3 className="text-lg font-semibold text-hornets-purple mb-4">
          About the Charlotte Hornets
        </h3>
        <div className="prose text-gray-600">
          <p className="mb-3">
            The Charlotte Hornets are a professional basketball team based in Charlotte, North Carolina. 
            This dashboard provides comprehensive analytics and insights into player performance and team statistics.
          </p>
          <p>
            Navigate through different sections using the sidebar to explore detailed player statistics, 
            shooting analysis, performance metrics, and more.
          </p>
        </div>
      </div>
    </div>
  );
}