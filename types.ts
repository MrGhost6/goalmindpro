
export type Language = 'en' | 'fr' | 'es' | 'ar';

export interface TranslationStrings {
  [key: string]: {
    [lang in Language]: string;
  };
}

export interface TeamStats {
  id: string;
  name: string;
  logo: string;
  form: string[]; // e.g. ['W', 'D', 'L', 'W', 'W']
  avgGoalsScored: number;
  avgGoalsConceded: number;
  bttsPercentage: number;
  over25Percentage: number;
}

export interface Match {
  id: string;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  kickoff: string;
  league: string;
  odds: {
    home: number;
    draw: number;
    away: number;
    over25: number;
    under25: number;
    bttsYes: number;
  };
}

export interface MarketProbability {
  marketCode: string; // e.g. "1", "1X", "DNB 1", "Over 2.5"
  marketName: string; // e.g. "Home Win", "Double Chance 1X"
  probability: number;
  impliedProbability: number;
  valueScore: number;
  odds: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation?: string;
}

export interface AnalysisResult {
  matchId: string;
  recommendations: MarketProbability[]; // Ranked from Low to High risk
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}
