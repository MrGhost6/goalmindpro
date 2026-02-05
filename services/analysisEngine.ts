
import { Match, MarketProbability, RiskLevel } from '../types';

function poisson(x: number, lambda: number): number {
  let factorial = 1;
  for (let i = 1; i <= x; i++) factorial *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, x)) / factorial;
}

export function calculateAllProbabilities(match: Match): MarketProbability[] {
  const homeLambda = (match.homeTeam.avgGoalsScored + match.awayTeam.avgGoalsConceded) / 2;
  const awayLambda = (match.awayTeam.avgGoalsScored + match.homeTeam.avgGoalsConceded) / 2;

  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  let over05 = 0, over15 = 0, over25 = 0, over35 = 0;
  let bttsYes = 0;

  for (let h = 0; h < 6; h++) {
    for (let a = 0; a < 6; a++) {
      const prob = poisson(h, homeLambda) * poisson(a, awayLambda);
      if (h > a) homeWinProb += prob;
      else if (h === a) drawProb += prob;
      else awayWinProb += prob;

      const total = h + a;
      if (total > 0.5) over05 += prob;
      if (total > 1.5) over15 += prob;
      if (total > 2.5) over25 += prob;
      if (total > 3.5) over35 += prob;
      if (h > 0 && a > 0) bttsYes += prob;
    }
  }

  const markets = [
    // 1X2
    { code: '1', name: 'Home Win', prob: homeWinProb, odds: match.odds.home },
    { code: 'X', name: 'Draw', prob: drawProb, odds: match.odds.draw },
    { code: '2', name: 'Away Win', prob: awayWinProb, odds: match.odds.away },
    // Double Chance
    { code: '1X', name: 'Home or Draw', prob: homeWinProb + drawProb, odds: 1 / ((1 / match.odds.home) + (1 / match.odds.draw)) },
    { code: '2X', name: 'Away or Draw', prob: awayWinProb + drawProb, odds: 1 / ((1 / match.odds.away) + (1 / match.odds.draw)) },
    { code: '12', name: 'Home or Away', prob: homeWinProb + awayWinProb, odds: 1 / ((1 / match.odds.home) + (1 / match.odds.away)) },
    // DNB (Simplified probability)
    { code: 'DNB 1', name: 'Draw No Bet 1', prob: homeWinProb / (homeWinProb + awayWinProb), odds: match.odds.home * 0.8 },
    { code: 'DNB 2', name: 'Draw No Bet 2', prob: awayWinProb / (homeWinProb + awayWinProb), odds: match.odds.away * 0.8 },
    // Over / Under
    { code: 'Over 1.5', name: 'Over 1.5 Goals', prob: over15, odds: 1.35 },
    { code: 'Over 2.5', name: 'Over 2.5 Goals', prob: over25, odds: match.odds.over25 },
    { code: 'Under 2.5', name: 'Under 2.5 Goals', prob: 1 - over25, odds: match.odds.under25 },
    // BTTS
    { code: 'BTTS Yes', name: 'BTTS Yes', prob: bttsYes, odds: match.odds.bttsYes },
    { code: 'BTTS No', name: 'BTTS No', prob: 1 - bttsYes, odds: 2.1 },
  ];

  return markets
    .map(m => {
      const valueScore = (m.prob * m.odds) - 1;
      let risk: 'Low' | 'Medium' | 'High' = 'Medium';
      if (m.prob > 0.75) risk = 'Low';
      else if (m.prob < 0.45) risk = 'High';

      return {
        marketCode: m.code,
        marketName: m.name,
        probability: m.prob,
        impliedProbability: 1 / m.odds,
        valueScore,
        odds: m.odds,
        riskLevel: risk as any
      };
    })
    // Sort by Probability Descending (Low Risk first)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 6);
}
