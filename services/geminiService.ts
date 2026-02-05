
import { GoogleGenAI, Type } from "@google/genai";
import { Match, MarketProbability, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchMatchDataViaAI(query: string): Promise<Match | null> {
  const prompt = `Act as a football statistician. Provide current league, team form (last 5), goals stats, and fair bookmaker odds for: "${query}". Return structured JSON only.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            league: { type: Type.STRING },
            homeTeam: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                form: { type: Type.ARRAY, items: { type: Type.STRING } },
                avgGoalsScored: { type: Type.NUMBER },
                avgGoalsConceded: { type: Type.NUMBER },
              },
              required: ["name", "form", "avgGoalsScored", "avgGoalsConceded"]
            },
            awayTeam: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                form: { type: Type.ARRAY, items: { type: Type.STRING } },
                avgGoalsScored: { type: Type.NUMBER },
                avgGoalsConceded: { type: Type.NUMBER },
              },
              required: ["name", "form", "avgGoalsScored", "avgGoalsConceded"]
            },
            odds: {
              type: Type.OBJECT,
              properties: {
                home: { type: Type.NUMBER },
                draw: { type: Type.NUMBER },
                away: { type: Type.NUMBER },
                over25: { type: Type.NUMBER },
                under25: { type: Type.NUMBER },
                bttsYes: { type: Type.NUMBER },
              },
              required: ["home", "draw", "away", "over25", "under25", "bttsYes"]
            }
          },
          required: ["league", "homeTeam", "awayTeam", "odds"]
        }
      }
    });
    const data = JSON.parse(response.text);
    return {
      ...data,
      id: `ai-${Date.now()}`,
      kickoff: new Date().toISOString(),
      homeTeam: { ...data.homeTeam, logo: `https://picsum.photos/seed/${data.homeTeam.name}/100/100` },
      awayTeam: { ...data.awayTeam, logo: `https://picsum.photos/seed/${data.awayTeam.name}/100/100` }
    };
  } catch (error) {
    console.error("fetchMatchDataViaAI Error:", error);
    return null;
  }
}

export async function explainRecommendedBets(
  match: Match,
  recommendations: MarketProbability[],
  lang: Language = 'en'
): Promise<Record<string, string>> {
  const prompt = `
    Analyze the match: ${match.homeTeam.name} vs ${match.awayTeam.name}.
    Explain the statistical reasoning for these markets: ${recommendations.map(r => r.marketCode).join(', ')}.
    Language: ${lang}.
    Return a JSON array of objects with "code" and "reason" fields.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["code", "reason"]
          }
        }
      }
    });
    
    const arr: {code: string, reason: string}[] = JSON.parse(response.text);
    const map: Record<string, string> = {};
    arr.forEach(item => { map[item.code] = item.reason; });
    return map;
  } catch (error) {
    console.error("explainRecommendedBets Error:", error);
    return {};
  }
}
