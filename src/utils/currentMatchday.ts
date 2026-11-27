import { Match } from '../types/tournament';

export function getCurrentMatchday(matches: Match[]): number | null {
  const inProgress = matches
    .filter((match) => match.status === 'En curso' && match.matchday !== null)
    .sort((a, b) => (a.matchday ?? 0) - (b.matchday ?? 0))[0];
  if (inProgress?.matchday !== null && inProgress?.matchday !== undefined) return inProgress.matchday;

  const upcoming = matches
    .filter((match) => match.status === 'Programado' && match.matchday !== null)
    .sort((a, b) => (a.matchday ?? 0) - (b.matchday ?? 0))[0];
  if (upcoming?.matchday !== null && upcoming?.matchday !== undefined) return upcoming.matchday;

  const completed = matches
    .filter((match) => match.status === 'Finalizado' && match.matchday !== null)
    .reduce((latest, match) => Math.max(latest, match.matchday ?? 0), 0);
  return completed || null;
}
