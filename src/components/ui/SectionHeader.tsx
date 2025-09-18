'use client';

import { useEffect, useState } from 'react';
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

export default function SectionHeader({ section, user }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    // This will only run on the client-side after the component mounts
    setCurrentTime(new Date().toLocaleString());
  }, []);

  return (
    <div className="stats-card-header">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-hornets-purple capitalize">
          {section}
        </h1>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <p>Welcome back, {user?.name || user?.email || 'User'}</p>
        <p className="mt-1">
          Last updated: {currentTime}
        </p>
      </div>
    </div>
  );
}
