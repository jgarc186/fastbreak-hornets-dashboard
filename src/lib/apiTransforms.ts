import { Player } from '@/types/player';

export interface ApiPlayerStats {
  player_id: number;
  pts: number;
  ast: number;
  reb: number;
  oreb: number;
  dreb: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  fga: number;
  fgm: number;
  fg3a: number;
  fg3m: number;
  fta: number;
  ftm: number;
  min: string;
  games_played: number;
  stl: number;
  blk: number;
  turnover: number;
  pf: number;
  season: number;
}

export interface ApiPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position?: string;
  height?: string;
  weight?: string;
  jersey_number?: string;
  college?: string;
  country?: string;
  draft_year?: number;
  draft_round?: number;
  draft_number?: number;
  team: {
    id: number;
    abbreviation: string;
    city: string;
    conference: string;
    division: string;
    full_name: string;
    name: string;
  };
}

export interface HornetsStatsResponse {
  players: Player[];
  lastUpdated: string;
  source: string;
  season: number;
}

export interface ApiError {
  error: string;
}

// Position mapping since Ball Don't Lie API doesn't provide reliable position data
export const PLAYER_POSITIONS: Record<string, string> = {
  "LaMelo Ball": "PG",
  "Terry Rozier": "SG", 
  "Gordon Hayward": "SF",
  "Miles Bridges": "PF",
  "P.J. Washington": "PF",
  "Mason Plumlee": "C",
  "Kelly Oubre Jr.": "SF",
  "Cody Martin": "SG",
  "Jalen McDaniels": "SF",
  "Nick Richards": "C",
  "Brandon Miller": "SF",
  "Mark Williams": "C",
  "Tre Mann": "PG",
  "JT Thor": "PF",
  "Bryce McGowens": "SG",
  "Kai Jones": "C",
  "Frank Ntilikina": "PG",
  "Dennis Smith Jr.": "PG",
  "Svi Mykhailiuk": "SG",
  "Vasilije Micic": "PG",
  "Grant Williams": "PF",
  "Tidjane Salaun": "SF",
  "Moussa Diabate": "C"
};

export function parseMinutesToDecimal(minString: string): number {
  if (!minString || minString === "0:00") return 0;
  const [minutes, seconds] = minString.split(':').map(Number);
  return minutes + (seconds / 60);
}

export function transformApiDataToPlayer(players: ApiPlayer[], statsData: ApiPlayerStats[]): Player[] {
  return players.map(player => {
    const stats = statsData.find(stat => stat.player_id === player.id);
    
    // Handle missing stats gracefully
    if (!stats || stats.games_played === 0) {
      return null;
    }
    
    const playerName = `${player.first_name} ${player.last_name}`;
    
    return {
      id: player.id,
      name: playerName,
      position: PLAYER_POSITIONS[playerName] || "N/A",
      pointsPerGame: Number(stats.pts.toFixed(1)),
      rebounds: Number(stats.reb.toFixed(1)),
      assists: Number(stats.ast.toFixed(1)),
      fieldGoalPercentage: Number((stats.fg_pct * 100).toFixed(1)),
      threePointPercentage: Number((stats.fg3_pct * 100).toFixed(1)),
      minutesPlayed: Number(parseMinutesToDecimal(stats.min).toFixed(1)),
      gamesPlayed: stats.games_played
    };
  }).filter(Boolean) as Player[];
}

export const ERROR_MESSAGES = {
  API_KEY: "Unable to fetch stats. Please check API configuration.",
  NETWORK: "Network error. Please check your connection and try again.",
  NO_DATA: "No stats available for the current season.",
  RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
  GENERIC: "Failed to load player stats. Please try again later."
} as const;