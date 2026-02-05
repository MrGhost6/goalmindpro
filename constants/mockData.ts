
import { Match } from '../types';

export const mockMatches: Match[] = [
  {
    id: 'm1',
    league: 'Premier League',
    kickoff: '2024-05-20T19:00:00Z',
    homeTeam: {
      id: 't1',
      name: 'Arsenal',
      logo: 'https://picsum.photos/seed/arsenal/100/100',
      form: ['W', 'W', 'W', 'D', 'W'],
      avgGoalsScored: 2.3,
      avgGoalsConceded: 0.8,
      bttsPercentage: 45,
      over25Percentage: 65,
    },
    awayTeam: {
      id: 't2',
      name: 'Chelsea',
      logo: 'https://picsum.photos/seed/chelsea/100/100',
      form: ['D', 'L', 'W', 'D', 'W'],
      avgGoalsScored: 1.5,
      avgGoalsConceded: 1.6,
      bttsPercentage: 60,
      over25Percentage: 55,
    },
    odds: {
      home: 1.55,
      draw: 4.20,
      away: 6.00,
      over25: 1.75,
      under25: 2.10,
      bttsYes: 1.85,
    }
  },
  {
    id: 'm2',
    league: 'La Liga',
    kickoff: '2024-05-20T20:30:00Z',
    homeTeam: {
      id: 't3',
      name: 'Real Madrid',
      logo: 'https://picsum.photos/seed/madrid/100/100',
      form: ['W', 'W', 'W', 'W', 'W'],
      avgGoalsScored: 2.6,
      avgGoalsConceded: 0.7,
      bttsPercentage: 40,
      over25Percentage: 70,
    },
    awayTeam: {
      id: 't4',
      name: 'Getafe',
      logo: 'https://picsum.photos/seed/getafe/100/100',
      form: ['L', 'D', 'L', 'W', 'L'],
      avgGoalsScored: 0.9,
      avgGoalsConceded: 1.2,
      bttsPercentage: 35,
      over25Percentage: 30,
    },
    odds: {
      home: 1.25,
      draw: 6.00,
      away: 12.00,
      over25: 1.60,
      under25: 2.30,
      bttsYes: 2.20,
    }
  },
  {
    id: 'm3',
    league: 'Ligue 1',
    kickoff: '2024-05-21T18:45:00Z',
    homeTeam: {
      id: 't5',
      name: 'PSG',
      logo: 'https://picsum.photos/seed/psg/100/100',
      form: ['W', 'D', 'W', 'W', 'L'],
      avgGoalsScored: 2.8,
      avgGoalsConceded: 1.1,
      bttsPercentage: 70,
      over25Percentage: 80,
    },
    awayTeam: {
      id: 't6',
      name: 'Lyon',
      logo: 'https://picsum.photos/seed/lyon/100/100',
      form: ['W', 'W', 'D', 'W', 'W'],
      avgGoalsScored: 1.8,
      avgGoalsConceded: 1.5,
      bttsPercentage: 75,
      over25Percentage: 75,
    },
    odds: {
      home: 1.40,
      draw: 4.80,
      away: 7.50,
      over25: 1.45,
      under25: 2.70,
      bttsYes: 1.55,
    }
  }
];
