import { GoogleGenAI } from '@google/genai';
import { Match } from '../types';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

function formatEvents(match: Match): string {
  if (!match.events || match.events.length === 0) return 'No events recorded yet.';
  return match.events
    .map((e) => `${e.time} — [${e.type}] ${e.description}`)
    .join('\n');
}

export async function generateMatchCommentary(match: Match): Promise<string> {
  const homeScore = match.homeScore !== null ? match.homeScore : '-';
  const awayScore = match.awayScore !== null ? match.awayScore : '-';
  const events = formatEvents(match);

  const prompt =
    `You are a sports journalist covering the Prabhananda Cup, an Under-16 football tournament in West Bengal, India. ` +
    `Write a 2-paragraph editorial summary for this match:\n\n` +
    `${match.homeTeam.name} ${homeScore} — ${awayScore} ${match.awayTeam.name}\n` +
    `Status: ${match.status}\n` +
    `Date: ${match.date}\n\n` +
    `Key events:\n${events}\n\n` +
    `Write in an energetic but factual sports journalism tone. Keep it under 120 words total.`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text ?? 'Commentary will be available after the match.';
  } catch {
    return 'Commentary will be available after the match.';
  }
}

export async function generatePostMatchSummary(match: Match): Promise<string> {
  const homeScore = match.homeScore !== null ? match.homeScore : '-';
  const awayScore = match.awayScore !== null ? match.awayScore : '-';
  const events = formatEvents(match);

  const winner =
    match.homeScore !== null && match.awayScore !== null
      ? match.homeScore > match.awayScore
        ? match.homeTeam.name
        : match.awayScore > match.homeScore
          ? match.awayTeam.name
          : 'Neither team — it ended in a draw'
      : 'Result not yet available';

  const prompt =
    `You are a sports journalist covering the Prabhananda Cup, an Under-16 football tournament in West Bengal, India. ` +
    `Write a 2-paragraph post-match summary for this finished match:\n\n` +
    `${match.homeTeam.name} ${homeScore} — ${awayScore} ${match.awayTeam.name}\n` +
    `Result: ${winner} won\n` +
    `Date: ${match.date}\n\n` +
    `Key events:\n${events}\n\n` +
    `Focus on the final result, standout performances, and what this means for the tournament. ` +
    `Write in an energetic but factual sports journalism tone. Keep it under 120 words total.`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text ?? 'Match summary will be available shortly.';
  } catch {
    return 'Match summary will be available shortly.';
  }
}
