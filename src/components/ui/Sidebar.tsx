"use client";

import { useState } from "react";
import { 
  BarChart3, 
  Trophy, 
  Target, 
  Radar, 
  Menu, 
  X,
  Home,
  LogOut
} from "lucide-react";

export type SectionType = 'overview' | 'leaderboard' | 'shooting' | 'distribution' | 'performance';

interface SidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  onLogout: () => void;
}

const navigationItems = [
  { id: 'overview' as SectionType, label: 'Overview', icon: Home },
  { id: 'leaderboard' as SectionType, label: 'Player Leaderboard', icon: Trophy },
  { id: 'shooting' as SectionType, label: 'Shooting Analysis', icon: Target },
  { id: 'distribution' as SectionType, label: 'Scoring Distribution', icon: BarChart3 },
  { id: 'performance' as SectionType, label: 'Performance Radar', icon: Radar },
];

export default function Sidebar({ activeSection, onSectionChange, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative
        top-0 left-0 h-screen lg:h-screen
        bg-hornets-teal text-white
        transition-transform duration-300 ease-in-out
        z-50
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:w-64
        flex flex-col
        overflow-y-auto
      `}>
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hornets-purple rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold">Hornets</h2>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden hover:bg-hornets-dark-purple p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation - flex-1 to take remaining space and allow scrolling */}
        <div className="flex-1 px-6 overflow-y-auto">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-hornets-purple text-white' 
                      : 'hover:bg-hornets-light-teal hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer - positioned at bottom */}
        <div className="p-6 border-t border-hornets-light-teal">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium hover:bg-hornets-dark-purple rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-hornets-teal text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
