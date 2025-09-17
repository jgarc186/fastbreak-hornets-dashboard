import { ReactNode } from "react";

interface LoadingWrapperProps {
  isLoading: boolean;
  children: ReactNode;
  height?: string;
}

export default function LoadingWrapper({ 
  isLoading, 
  children, 
  height = "h-64" 
}: LoadingWrapperProps) {
  if (isLoading) {
    return (
      <div className="stats-card p-6">
        <div className={`hornets-pulse bg-hornets-light-teal opacity-20 ${height} rounded flex items-center justify-center`}>
          <div className="text-center">
            <div className="basketball-bounce text-hornets-purple text-lg font-semibold mb-2">
              🏀
            </div>
            <span className="text-hornets-purple font-medium">
              Loading stats...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}