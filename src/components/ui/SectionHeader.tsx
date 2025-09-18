'use client';

import { useState, useEffect } from "react";
import { SectionType } from "./Sidebar";

interface SectionHeaderProps {
  section: SectionType;
  user?: {
    name?: string;
    email?: string;
  };
}

const sectionConfig = {
  overview: {
    title: "Dashboard Overview",
    description: "Get a quick snapshot of the Charlotte Hornets' current season performance, including win-loss record, key player stats, and recent game highlights."
  },
  leaderboard: {
    title: "Player Leaderboard",
    description: "View the top performing Charlotte Hornets players ranked by key statistics including points, assists, rebounds, and shooting percentages. Click on any player to see detailed breakdown."
  },
  shooting: {
    title: "Shooting Analysis",
    description: "Analyze shooting efficiency across the roster with field goal percentages, three-point accuracy, and shot selection data. Identify the most efficient scorers and areas for improvement."
  },
  distribution: {
    title: "Scoring Distribution",
    description: "Explore how points are distributed across the team with visual breakdowns of scoring patterns, quarter-by-quarter performance, and offensive contribution analysis."
  },
  performance: {
    title: "Performance Radar",
    description: "Compare player performance across multiple statistical categories with comprehensive radar charts showing strengths, weaknesses, and overall player impact."
  }
};

export default function SectionHeader({ section, user }: SectionHeaderProps) {
  const config = sectionConfig[section];
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    // This will only run on the client-side after the component mounts
    setCurrentTime(new Date().toLocaleString());
  }, []);

  if (section === 'overview') {
    return (
      <div className="stats-card p-6 mb-6">
        <h1 className="stats-number text-hornets-purple">
          Charlotte Hornets Player Insights
        </h1>
        <p className="text-hornets-teal mt-2">
          Welcome back, {user?.name || user?.email || 'User'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {currentTime}
        </p>
      </div>
    );
  }

  return (
    <div className="stats-card p-6 mb-6">
      <div className="border-l-4 border-hornets-teal pl-4">
        <h2 className="stats-number text-hornets-purple mb-2">
          {config.title}
        </h2>
        <p className="text-hornets-teal text-sm leading-relaxed">
          {config.description}
        </p>
        <p className="text-xs text-gray-500 mt-3">
          Last updated: {currentTime}
        </p>
      </div>
    </div>
  );
}

