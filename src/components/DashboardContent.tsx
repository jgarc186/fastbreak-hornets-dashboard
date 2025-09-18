"use client";

import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/player";
import { HornetsStatsResponse, ApiError, ERROR_MESSAGES } from "@/lib/apiTransforms";
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
  const [playersData, setPlayersData] = useState<Player[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch Hornets stats from API
  const fetchHornetsStats = useCallback(async () => {
    try {
      setDataLoading(true);
      setDataError(null);
      
      const response = await fetch('/api/hornets-stats');
      const data = await response.json();
      
      if (!response.ok) {
        const errorData = data as ApiError;
        throw new Error(errorData.error || ERROR_MESSAGES.GENERIC);
      }
      
      const statsResponse = data as HornetsStatsResponse;
      setPlayersData(statsResponse.players);
      
    } catch (error: unknown) {
      console.error('Failed to fetch Hornets stats:', error);
      
      // Set user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key')) {
        setDataError(ERROR_MESSAGES.API_KEY);
      } else if (errorMessage.includes('Rate limit')) {
        setDataError(ERROR_MESSAGES.RATE_LIMIT);
      } else if (errorMessage.includes('Network')) {
        setDataError(ERROR_MESSAGES.NETWORK);
      } else {
        setDataError(ERROR_MESSAGES.GENERIC);
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchHornetsStats();
  }, [fetchHornetsStats]);

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

  const retryFetch = () => {
    fetchHornetsStats();
  };

  const renderActiveSection = () => {
    const chartProps = {
      players: playersData,
      loading: dataLoading,
      error: dataError,
      onRetry: retryFetch
    };

    switch(activeSection) {
      case 'overview':
        return <OverviewSection user={user} onSectionChange={setActiveSection} />;
      case 'leaderboard':
        return (
          <div className="stats-card p-6">
            <PlayerLeaderboard {...chartProps} />
          </div>
        );
      case 'shooting':
        return (
          <div className="stats-card p-6">
            <ShootingEfficiency {...chartProps} />
          </div>
        );
      case 'distribution':
        return (
          <div className="stats-card p-6">
            <PointsDistribution {...chartProps} />
          </div>
        );
      case 'performance':
        return (
          <div className="stats-card p-6">
            <PerformanceRadarChart {...chartProps} />
          </div>
        );
      default:
        return <OverviewSection user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 lg:ml-64 bg-white">
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
