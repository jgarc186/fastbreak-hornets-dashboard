"use client";

import { useState, useEffect, useCallback } from "react";
import { Player } from "@/types/player";
import { HornetsStatsResponse, ApiError, ERROR_MESSAGES } from "@/lib/apiTransforms";
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
  const [playersData, setPlayersData] = useState<Player[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [useRealData, setUseRealData] = useState(true);

  // Fetch Hornets stats from API
  const fetchHornetsStats = useCallback(async () => {
    if (!useRealData) {
      setPlayersData(charlotteHornetsPlayers);
      setDataLoading(false);
      return;
    }

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
      setLastUpdated(statsResponse.lastUpdated);
      
    } catch (error: unknown) {
      console.error('Failed to fetch Hornets stats:', error);
      
      // Fallback to mock data on error
      setPlayersData(charlotteHornetsPlayers);
      
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
  }, [useRealData]);

  // Load data on component mount
  useEffect(() => {
    fetchHornetsStats();
  }, [useRealData, fetchHornetsStats]);

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

  const toggleDataSource = () => {
    setUseRealData(!useRealData);
  };

  const renderDataSourceToggle = () => (
    <div className="mb-4 p-3 bg-hornets-light-teal bg-opacity-10 rounded-lg border border-hornets-light-teal border-opacity-20">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-hornets-purple">Data Source: </span>
          <span className="text-sm text-hornets-teal">
            {useRealData ? 'Live API Data' : 'Mock Data'}
          </span>
          {lastUpdated && useRealData && (
            <span className="text-xs text-hornets-teal ml-2">
              (Updated: {new Date(lastUpdated).toLocaleTimeString()})
            </span>
          )}
        </div>
        <button
          onClick={toggleDataSource}
          className="text-xs bg-hornets-teal text-white px-3 py-1 rounded hover:bg-hornets-purple transition-colors"
        >
          Switch to {useRealData ? 'Mock' : 'Live'} Data
        </button>
      </div>
      {dataError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
          <div className="text-red-700 font-medium">API Error:</div>
          <div className="text-red-600">{dataError}</div>
          <button
            onClick={retryFetch}
            className="mt-1 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );

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
          <div>
            {renderDataSourceToggle()}
            <div className="stats-card p-6">
              <PlayerLeaderboard {...chartProps} />
            </div>
          </div>
        );
      case 'shooting':
        return (
          <div>
            {renderDataSourceToggle()}
            <div className="stats-card p-6">
              <ShootingEfficiency {...chartProps} />
            </div>
          </div>
        );
      case 'distribution':
        return (
          <div>
            {renderDataSourceToggle()}
            <div className="stats-card p-6">
              <PointsDistribution {...chartProps} />
            </div>
          </div>
        );
      case 'performance':
        return (
          <div>
            {renderDataSourceToggle()}
            <div className="stats-card p-6">
              <PerformanceRadarChart {...chartProps} />
            </div>
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
