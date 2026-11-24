import { Match } from '../types/tournament';

export function getCurrentMatchday(matches: Match[]): number {
  const inProgress = matches
    .filter((match) => match.status === 'En curso')
    .sort((a, b) => a.matchday - b.matchday)[0];
  if (inProgress) return inProgress.matchday;

  const upcoming = matches
    .filter((match) => match.status === 'Programado')
    .sort((a, b) => a.matchday - b.matchday)[0];
  if (upcoming) return upcoming.matchday;

  const completed = matches
    .filter((match) => match.status === 'Finalizado')
    .reduce((latest, match) => Math.max(latest, match.matchday), 0);
  return completed || 1;
}
