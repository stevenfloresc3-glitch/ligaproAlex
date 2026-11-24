import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Club, QualificationZone } from '../types/tournament';
import { ClubBadge } from './ClubBadge';

interface StandingsViewProps {
  clubs: Club[];
  compact?: boolean;
  onSelectClub?: (clubId: string) => void;
}

type ZoneFilter = 'all' | QualificationZone;

export function getZoneForRank(rank: number): {
  zone: QualificationZone;
  label: string;
  indicatorClass: string;
  textClass: string;
} {
  if (rank <= 4) {
    return {
      zone: 'libertadores',
      label: 'Libertadores',
      indicatorClass: 'bg-[#047857]',
      textClass: 'text-[#065F46]',
    };
  }
  if (rank <= 8) {
    return {
      zone: 'sudamericana',
      label: 'Sudamericana',
      indicatorClass: 'bg-[#1E3A8A]',
      textClass: 'text-[#1E3A8A]',
    };
  }
  if (rank >= 15) {
    return {
      zone: 'descenso',
      label: 'Descenso',
      indicatorClass: 'bg-red-700',
      textClass: 'text-red-800',
    };
  }
  return {
    zone: 'permanencia',
    label: 'Permanencia',
    indicatorClass: 'bg-slate-300',
    textClass: 'text-slate-600',
  };
}

export function sortClubs(clubs: Club[]) {
  return [...clubs].sort((a, b) => {
    const ptsA = a.pg * 3 + a.pe;
    const ptsB = b.pg * 3 + b.pe;
    if (ptsB !== ptsA) return ptsB - ptsA;
    const dgA = a.gf - a.gc;
    const dgB = b.gf - b.gc;
    if (dgB !== dgA) return dgB - dgA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  clubs,
  compact = false,
  onSelectClub,
}) => {
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [tableMode, setTableMode] = useState<'fan' | 'official'>('fan');

  const rankedClubs = useMemo(() => {
    return sortClubs(clubs).map((club, idx) => ({
      ...club,
      rank: idx + 1,
      pts: club.pg * 3 + club.pe,
      dg: club.gf - club.gc,
      zoneInfo: getZoneForRank(idx + 1),
    }));
  }, [clubs]);

  const fanRankedClubs = useMemo(() => {
    const favorite = rankedClubs.find((club) => club.id === 'bsc' || club.name.toLowerCase().includes('barcelona'));
    if (!favorite) return rankedClubs;
    const others = rankedClubs.filter((club) => club !== favorite);
    const [formerLeader, formerSecond, ...remaining] = others;
    const fanOrder = [favorite, formerSecond, formerLeader, ...remaining].filter(
      (club): club is NonNullable<typeof club> => club !== undefined,
    );

    return fanOrder.map((club, index) => {
      const position = index + 1;
      const points = position === 1 ? 40 : position === 2 ? 37 : position === 3 ? 34 : Math.max(0, 31 - (position - 4) * 2);
      const played = 14;
      const wins = Math.floor(points / 3);
      const draws = points % 3;
      const losses = Math.max(0, played - wins - draws);
      const fantasyRecord = { pj: played, pg: wins, pe: draws, pp: losses, gf: club.gf, gc: club.gc };
      if (position === 1) { fantasyRecord.gf = 32; fantasyRecord.gc = 9; }
      if (position === 2) { fantasyRecord.gf = 28; fantasyRecord.gc = 13; }
      if (position === 3) { fantasyRecord.gf = 26; fantasyRecord.gc = 14; }
      return {
        ...club,
        ...fantasyRecord,
        rank: position,
        pts: points,
        dg: fantasyRecord.gf - fantasyRecord.gc,
        zoneInfo: getZoneForRank(position),
      };
    });
  }, [rankedClubs]);

  const filteredClubs = useMemo(() => {
    const source = tableMode === 'fan' ? fanRankedClubs : rankedClubs;
    const list = compact ? source.slice(0, 6) : source;
    return list.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase());
      const matchesZone =
        zoneFilter === 'all' || c.zoneInfo.zone === zoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [rankedClubs, fanRankedClubs, tableMode, compact, search, zoneFilter]);

  const isFanMode = tableMode === 'fan';

  return (
    <section
      aria-label="Tabla de Posiciones LigaPro Serie A"
      className="rounded-2xl border border-[#E2E8F0] bg-white"
    >
      {!compact && (
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Tabla de Posiciones · Serie A 2026
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              {isFanMode ? 'Modo hincha · tabla de fantasía; no cambia los resultados oficiales' : 'Fase Inicial · Clasificación oficial según puntos, diferencia y goles'}
            </p>
            <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setTableMode('fan')} aria-pressed={isFanMode} className={`min-h-9 rounded-lg px-3 text-xs font-bold ${isFanMode ? 'bg-[#1E3A8A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Modo hincha</button>
              <button type="button" onClick={() => setTableMode('official')} aria-pressed={!isFanMode} className={`min-h-9 rounded-lg px-3 text-xs font-bold ${!isFanMode ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Tabla oficial</button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar club o ciudad..."
                aria-label="Buscar club o ciudad en la tabla"
                className="min-h-[44px] w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-slate-500 focus-visible:border-[#1E3A8A] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/25 sm:w-56"
              />
            </div>
          </div>
        </div>
      )}

      {!compact && (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2.5">
          {(
            [
              { id: 'all', label: 'Todos (16)' },
              { id: 'libertadores', label: 'Libertadores (1°–4°)' },
              { id: 'sudamericana', label: 'Sudamericana (5°–8°)' },
              { id: 'descenso', label: 'Descenso (15°–16°)' },
            ] as const
          ).map((tab) => {
            const active = zoneFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setZoneFilter(tab.id)}
                className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                  active
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-white text-slate-700 border border-[#E2E8F0] hover:text-[#1E3A8A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {compact && isFanMode && (
        <p className="border-b border-yellow-200 bg-yellow-50 px-5 py-2.5 text-xs font-semibold text-yellow-950">⭐ Modo hincha: Barcelona primero con 40 puntos ficticios; el líder anterior aparece tercero.</p>
      )}

      {!compact && isFanMode && (
        <div className="mx-5 mt-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs leading-relaxed text-yellow-950">
          Tabla ficticia de hincha: Barcelona aparece primero con 40 puntos; el segundo anterior permanece segundo y el líder anterior queda tercero. Estos puntos no representan estadísticas oficiales ni se guardan en Neon.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[660px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-slate-600">
              <th scope="col" className="py-3 pl-5 pr-2 w-12">
                Pos
              </th>
              <th scope="col" className="py-3 px-3">
                Club
              </th>
              <th scope="col" className="py-3 px-2.5 text-right font-mono-tabular">
                PJ
              </th>
              <th scope="col" className="py-3 px-2.5 text-right font-mono-tabular">
                PG
              </th>
              <th scope="col" className="py-3 px-2.5 text-right font-mono-tabular">
                PE
              </th>
              <th scope="col" className="py-3 px-2.5 text-right font-mono-tabular">
                PP
              </th>
              <th scope="col" className="py-3 px-2.5 text-right font-mono-tabular">
                GF
              </th>
              <th scope="col" className="py-3 px-2.5 text-right font-mono-tabular">
                GC
              </th>
              <th scope="col" className="py-3 px-2.5 text-right font-mono-tabular">
                DG
              </th>
              <th scope="col" className="py-3 px-3 text-right font-mono-tabular text-[#0F172A]">
                PTS
              </th>
              {!compact && (
                <th scope="col" className="py-3 pl-3 pr-5">
                  Racha
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-sm">
            {filteredClubs.length === 0 ? (
              <tr>
                <td
                  colSpan={compact ? 10 : 11}
                  className="px-5 py-10 text-center text-sm text-slate-600"
                >
                  No se encontraron clubes que coincidan con el filtro aplicado.
                </td>
              </tr>
            ) : (
              filteredClubs.map((club) => (
                <tr
                  key={club.id}
                  onClick={() => onSelectClub?.(club.id)}
                  className={`transition-colors hover:bg-[#F8FAFC] ${club.id === 'bsc' || club.name.toLowerCase().includes('barcelona') ? 'bg-yellow-50/70' : ''} ${onSelectClub ? 'cursor-pointer' : ''}`}
                >
                  <td className="py-3 pl-5 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-5 w-1 rounded-xs ${club.zoneInfo.indicatorClass}`}
                        aria-hidden="true"
                      />
                      <span className="font-mono-tabular font-semibold text-[#0F172A]">
                        {club.rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <ClubBadge club={club} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0F172A] truncate">
                          {club.name}{(club.id === 'bsc' || club.name.toLowerCase().includes('barcelona')) && <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-900">Favorito</span>}
                        </p>
                        {!compact && (
                          <p className="text-xs text-slate-500 truncate">
                            {club.city} · {club.zoneInfo.label}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono-tabular text-slate-700">
                    {club.pj}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono-tabular text-slate-700">
                    {club.pg}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono-tabular text-slate-700">
                    {club.pe}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono-tabular text-slate-700">
                    {club.pp}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono-tabular text-slate-700">
                    {club.gf}
                  </td>
                  <td className="py-3 px-2.5 text-right font-mono-tabular text-slate-700">
                    {club.gc}
                  </td>
                  <td
                    className={`py-3 px-2.5 text-right font-mono-tabular font-medium ${
                      club.dg > 0
                        ? 'text-[#047857]'
                        : club.dg < 0
                        ? 'text-red-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {club.dg > 0 ? `+${club.dg}` : club.dg}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-base font-bold text-[#1E3A8A]">
                    {club.pts}
                  </td>
                  {!compact && (
                    <td className="py-3 pl-3 pr-5">
                      <div className="flex items-center gap-1" aria-label="Últimos 5 partidos">
                        {club.form.map((res, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-[11px] font-mono-tabular font-bold ${
                              res === 'G'
                                ? 'bg-emerald-100 text-[#065F46]'
                                : res === 'E'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {res}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Leyenda accesible (nunca solo por color) */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <span className="h-3 w-1.5 rounded-xs bg-[#047857]" aria-hidden="true" />
          <span>1°–4°: Copa Libertadores</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-1.5 rounded-xs bg-[#1E3A8A]" aria-hidden="true" />
          <span>5°–8°: Copa Sudamericana</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-1.5 rounded-xs bg-red-700" aria-hidden="true" />
          <span>15°–16°: Zona de Descenso</span>
        </div>
      </div>
    </section>
  );
};
