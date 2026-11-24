import React, { useMemo, useState } from 'react';
import { Save, RotateCcw, TrendingUp } from 'lucide-react';
import { Club, Match } from '../types/tournament';
import { ClubBadge } from './ClubBadge';

type Score = { home: number | null; away: number | null };
type Predictions = Record<string, Score>;
const STORAGE_KEY = 'ligapro-pronosticos-v1';

function readSavedPredictions(): Predictions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Predictions : {};
  } catch {
    return {};
  }
}

interface PronosticosViewProps {
  matches: Match[];
  clubs: Club[];
}

export const PronosticosView: React.FC<PronosticosViewProps> = ({ matches, clubs }) => {
  const [predictions, setPredictions] = useState<Predictions>(readSavedPredictions);
  const [saved, setSaved] = useState(false);
  const clubMap = useMemo(() => new Map(clubs.map((club) => [club.id, club])), [clubs]);
  const rounds = useMemo(
    () => [...new Set(matches.filter((match) => match.status === 'Programado').map((match) => match.matchday))].sort((a, b) => a - b),
    [matches],
  );
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const roundNumber = selectedRound && rounds.includes(selectedRound) ? selectedRound : rounds[0];
  const roundMatches = matches.filter((match) => match.matchday === roundNumber && match.status === 'Programado');

  const updateScore = (matchId: string, side: 'home' | 'away', raw: string) => {
    setSaved(false);
    const value = raw === '' ? null : Math.min(15, Math.max(0, Number(raw)));
    setPredictions((current) => ({
      ...current,
      [matchId]: { ...(current[matchId] ?? { home: null, away: null }), [side]: value },
    }));
  };

  const projectedTable = useMemo(() => {
    const rows = new Map(clubs.map((club) => [club.id, {
      club,
      pj: club.pj,
      pg: club.pg,
      pe: club.pe,
      pp: club.pp,
      gf: club.gf,
      gc: club.gc,
      pts: club.pg * 3 + club.pe,
    }]));

    roundMatches.forEach((match) => {
      const score = predictions[match.id];
      if (score?.home == null || score.away == null) return;
      const home = rows.get(match.homeClubId);
      const away = rows.get(match.awayClubId);
      if (!home || !away) return;
      home.pj += 1; away.pj += 1;
      home.gf += score.home; home.gc += score.away;
      away.gf += score.away; away.gc += score.home;
      if (score.home > score.away) { home.pg += 1; home.pts += 3; away.pp += 1; }
      else if (score.home < score.away) { away.pg += 1; away.pts += 3; home.pp += 1; }
      else { home.pe += 1; away.pe += 1; home.pts += 1; away.pts += 1; }
    });

    return [...rows.values()].sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf || a.club.name.localeCompare(b.club.name, 'es'));
  }, [clubs, predictions, roundMatches]);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };

  const resetRound = () => {
    setSaved(false);
    setPredictions((current) => {
      const next = { ...current };
      roundMatches.forEach((match) => delete next[match.id]);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#047857]">Simulador de resultados</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-[#0F172A]">Haz tus pronósticos</h1>
            <p className="mt-1 text-sm text-slate-600">Ingresa los goles que imaginas para cada partido y observa cómo cambiaría la tabla.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetRound} disabled={!roundMatches.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <RotateCcw className="h-4 w-4" /> Reiniciar fecha
            </button>
            <button type="button" onClick={save} disabled={!roundMatches.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#172E6E] disabled:opacity-50">
              <Save className="h-4 w-4" /> Guardar pronósticos
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-slate-700">Fecha:</span>
          {rounds.map((round) => (
            <button key={round} type="button" onClick={() => setSelectedRound(round)} aria-pressed={roundNumber === round} className={`min-h-9 rounded-lg px-3 text-sm font-semibold ${roundNumber === round ? 'bg-[#1E3A8A] text-white' : 'border border-[#CBD5E1] text-slate-700 hover:bg-slate-50'}`}>
              {round}
            </button>
          ))}
        </div>

        {saved && <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">Pronósticos guardados en este navegador.</p>}

        {roundMatches.length ? (
          <div className="mt-4 divide-y divide-[#E2E8F0]">
            {roundMatches.map((match) => {
              const home = clubMap.get(match.homeClubId);
              const away = clubMap.get(match.awayClubId);
              if (!home || !away) return null;
              const score = predictions[match.id] ?? { home: null, away: null };
              return (
                <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4 sm:gap-5">
                  <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                    <span className="truncate text-sm font-semibold text-slate-800">{home.name}</span>
                    <ClubBadge club={home} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input aria-label={`Goles pronosticados para ${home.name}`} type="number" min="0" max="15" inputMode="numeric" value={score.home ?? ''} onChange={(event) => updateScore(match.id, 'home', event.target.value)} className="h-11 w-12 rounded-lg border border-[#CBD5E1] text-center font-mono text-lg font-bold text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-blue-100" />
                    <span className="text-sm font-bold text-slate-400">–</span>
                    <input aria-label={`Goles pronosticados para ${away.name}`} type="number" min="0" max="15" inputMode="numeric" value={score.away ?? ''} onChange={(event) => updateScore(match.id, 'away', event.target.value)} className="h-11 w-12 rounded-lg border border-[#CBD5E1] text-center font-mono text-lg font-bold text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div className="flex min-w-0 items-center gap-2">
                    <ClubBadge club={away} size="sm" />
                    <span className="truncate text-sm font-semibold text-slate-800">{away.name}</span>
                  </div>
                  <p className="col-span-3 -mt-2 text-center text-xs text-slate-500">Fecha {match.matchday} · {match.date} · {match.time}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-[#CBD5E1] bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-800">No hay partidos programados para pronosticar.</p>
            <p className="mt-1 text-sm text-slate-600">Cuando haya una fecha abierta, aparecerá aquí.</p>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">Los pronósticos se guardan en este navegador. La simulación es orientativa y no modifica los resultados oficiales.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-5 py-4">
          <TrendingUp className="h-5 w-5 text-[#047857]" />
          <div>
            <h2 className="font-display font-bold text-[#0F172A]">Tabla simulada</h2>
            <p className="text-xs text-slate-500">Proyección con tus marcadores · se ordena por puntos, diferencia y goles</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Pos.</th><th className="px-4 py-3">Club</th><th className="px-3 py-3 text-center">PJ</th><th className="px-3 py-3 text-center">GF</th><th className="px-3 py-3 text-center">GC</th><th className="px-3 py-3 text-center">DG</th><th className="px-4 py-3 text-right">Pts</th></tr></thead>
            <tbody className="divide-y divide-[#E2E8F0]">{projectedTable.map((row, index) => <tr key={row.club.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-mono font-semibold text-slate-500">{index + 1}</td><td className="px-4 py-3"><span className="flex items-center gap-2"><ClubBadge club={row.club} size="sm" /><span className="font-semibold text-slate-800">{row.club.name}</span></span></td><td className="px-3 py-3 text-center font-mono">{row.pj}</td><td className="px-3 py-3 text-center font-mono">{row.gf}</td><td className="px-3 py-3 text-center font-mono">{row.gc}</td><td className="px-3 py-3 text-center font-mono">{row.gf - row.gc}</td><td className="px-4 py-3 text-right font-mono font-bold">{row.pts}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
