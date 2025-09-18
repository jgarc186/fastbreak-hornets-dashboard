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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      setLastUpdated(statsResponse.lastUpdated);
      setDataSource(statsResponse.source || 'Unknown');
      
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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // First trigger a data sync
      const syncResponse = await fetch('/api/sync-hornets-data', { method: 'POST' });
      const syncResult = await syncResponse.json();
      
      if (syncResult.success) {
        // Then refetch the data
        await fetchHornetsStats();
      } else {
        console.warn('Sync failed, refetching cached data anyway');
        await fetchHornetsStats();
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
      // Still try to refetch data even if sync fails
      await fetchHornetsStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours < 1) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderDataFreshnessIndicator = () => (
    <div className="mb-4 p-3 bg-hornets-light-teal bg-opacity-10 rounded-lg border border-hornets-light-teal border-opacity-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-sm font-medium text-hornets-purple">Data Source: </span>
            <span className="text-sm text-hornets-teal">{dataSource}</span>
          </div>
          {lastUpdated && (
            <div>
              <span className="text-sm font-medium text-hornets-purple">Updated: </span>
              <span className="text-sm text-hornets-teal">{formatLastUpdated(lastUpdated)}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing || dataLoading}
          className="flex items-center space-x-2 text-xs bg-hornets-teal text-white px-3 py-2 rounded hover:bg-hornets-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>
      {dataError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
          <div className="text-red-700 font-medium">Data Error:</div>
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
            {renderDataFreshnessIndicator()}
            <div className="stats-card p-6">
              <PlayerLeaderboard {...chartProps} />
            </div>
          </div>
        );
      case 'shooting':
        return (
          <div>
            {renderDataFreshnessIndicator()}
            <div className="stats-card p-6">
              <ShootingEfficiency {...chartProps} />
            </div>
          </div>
        );
      case 'distribution':
        return (
          <div>
            {renderDataFreshnessIndicator()}
            <div className="stats-card p-6">
              <PointsDistribution {...chartProps} />
            </div>
          </div>
        );
      case 'performance':
        return (
          <div>
            {renderDataFreshnessIndicator()}
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
