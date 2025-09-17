"use client";

import { useState, useEffect } from "react";
import { charlotteHornetsPlayers } from "@/lib/mockData";
import PlayerLeaderboard from "./charts/PlayerLeaderboard";
import ShootingEfficiency from "./charts/ShootingEfficiency";
import PointsDistribution from "./charts/PointsDistribution";
import PerformanceRadarChart from "./charts/PerformanceRadarChart";
import Sidebar, { SectionType } from "./ui/Sidebar";
import SectionHeader from "./ui/SectionHeader";
import LoadingWrapper from "./ui/LoadingWrapper";
import OverviewSection from "./OverviewSection";

interface DashboardContentProps {
  user: {
    name?: string;
    email?: string;
  };
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading when switching sections
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeSection]);

  const handleLogout = () => {
    window.location.href = '/auth/logout';
  };

  const renderActiveSection = () => {
    switch(activeSection) {
      case 'overview':
        return <OverviewSection user={user} />;
      case 'leaderboard':
        return (
          <div className="stats-card p-6">
            <PlayerLeaderboard players={charlotteHornetsPlayers} />
          </div>
        );
      case 'shooting':
        return (
          <div className="stats-card p-6">
            <ShootingEfficiency players={charlotteHornetsPlayers} />
          </div>
        );
      case 'distribution':
        return (
          <div className="stats-card p-6">
            <PointsDistribution players={charlotteHornetsPlayers} />
          </div>
        );
      case 'performance':
        return (
          <div className="stats-card p-6">
            <PerformanceRadarChart players={charlotteHornetsPlayers} />
          </div>
        );
      default:
        return <OverviewSection user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 lg:ml-64 court-pattern">
          <div className="p-6 max-w-6xl mx-auto">
            <SectionHeader section={activeSection} user={user} />
            
            <LoadingWrapper isLoading={isLoading} height="h-96">
              {renderActiveSection()}
            </LoadingWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
