import React, { useMemo, useState } from 'react';
import { MapPin, Search, UserCheck, X } from 'lucide-react';
import { Club, PlayerStat } from '../types/tournament';
import { ClubBadge } from './ClubBadge';
import { sortClubs } from './StandingsView';

interface ClubsViewProps {
  clubs: Club[];
  players: PlayerStat[];
}

export const ClubsView: React.FC<ClubsViewProps> = ({ clubs, players }) => {
  const [query, setQuery] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  const sortedWithRank = useMemo(() => {
    return sortClubs(clubs).map((c, idx) => ({
      ...c,
      rank: idx + 1,
      pts: c.pg * 3 + c.pe,
      dg: c.gf - c.gc,
    }));
  }, [clubs]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sortedWithRank;
    const q = query.toLowerCase();
    return sortedWithRank.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.stadium.toLowerCase().includes(q)
    );
  }, [sortedWithRank, query]);

  const activeClub = sortedWithRank.find((c) => c.id === selectedClubId) ?? null;
  const activeClubPlayers = players.filter((p) => p.clubId === selectedClubId);

  return (
    <section aria-label="Clubes participantes LigaPro Serie A" className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Clubes Oficiales · Serie A 2026
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            16 instituciones afiliadas con sede, estadio y cuerpo técnico acreditado.
          </p>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar por club o ciudad..."
            aria-label="Filtrar clubes"
            className="min-h-[44px] w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-slate-500 focus-visible:border-[#1E3A8A] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/25 sm:w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center text-sm text-slate-600">
          No se encontraron clubes con ese criterio de búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((club) => (
            <article
              key={club.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-colors hover:border-slate-300"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <ClubBadge club={club} size="lg" />
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-[#0F172A] truncate">
                        {club.name}
                      </h3>
                      <p className="text-xs text-slate-600 truncate">
                        {club.city} · Posición {club.rank}°
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-lg font-bold text-[#1E3A8A] shrink-0">
                    {club.pts} pts
                  </span>
                </div>

                <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Estadio</dt>
                    <dd className="font-medium text-[#0F172A] truncate text-right">
                      {club.stadium}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Director Técnico</dt>
                    <dd className="font-medium text-[#0F172A] truncate text-right">
                      {club.coach}
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClubId(club.id)}
                className="mt-4 min-h-[44px] w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2 text-xs font-semibold text-[#1E3A8A] transition-colors hover:border-[#1E3A8A] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
              >
                Ver ficha institucional y jugadores
              </button>
            </article>
          ))}
        </div>
      )}

      {activeClub && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="club-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <ClubBadge club={activeClub} size="lg" />
                <div>
                  <h3
                    id="club-modal-title"
                    className="font-display text-lg font-bold text-[#0F172A]"
                  >
                    {activeClub.name}
                  </h3>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {activeClub.stadium} · {activeClub.city}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClubId(null)}
                aria-label="Cerrar ficha del club"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
              <div>
                <p className="text-xs text-slate-500">Pos</p>
                <p className="font-mono-tabular text-base font-bold text-[#0F172A]">
                  {activeClub.rank}°
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Pts</p>
                <p className="font-mono-tabular text-base font-bold text-[#1E3A8A]">
                  {activeClub.pts}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">GF / GC</p>
                <p className="font-mono-tabular text-base font-bold text-[#0F172A]">
                  {activeClub.gf}:{activeClub.gc}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">DG</p>
                <p className="font-mono-tabular text-base font-bold text-[#047857]">
                  {activeClub.dg > 0 ? `+${activeClub.dg}` : activeClub.dg}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <UserCheck className="h-4 w-4 text-[#047857]" aria-hidden="true" />
                <span>Director Técnico: {activeClub.coach}</span>
              </div>

              <h4 className="mt-4 font-display text-sm font-bold text-[#0F172A]">
                Jugadores destacados en registros oficiales
              </h4>
              {activeClubPlayers.length === 0 ? (
                <p className="mt-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs text-slate-600">
                  Plantilla completa disponible en el padrón oficial del Comité de Competiciones.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-[#E2E8F0]">
                  {activeClubPlayers.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-[#0F172A]">
                          #{p.number} {p.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {p.position} · {p.matches} PJ
                        </p>
                      </div>
                      <div className="text-right font-mono-tabular text-xs">
                        <p className="font-bold text-[#1E3A8A]">{p.goals} goles</p>
                        <p className="text-slate-600">{p.assists} asist.</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedClubId(null)}
              className="mt-5 min-h-[46px] w-full rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#172E6E]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

interface StatsViewProps {
  players: PlayerStat[];
  clubs: Club[];
  emptyMessage?: string;
}

export const StatsView: React.FC<StatsViewProps> = ({ players, clubs, emptyMessage = 'No hay estadísticas individuales para mostrar.' }) => {
  const [category, setCategory] = useState<'goles' | 'asistencias' | 'disciplina'>('goles');

  const clubMap = useMemo(() => {
    const map = new Map<string, Club>();
    clubs.forEach((c) => map.set(c.id, c));
    return map;
  }, [clubs]);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (category === 'goles') return b.goals - a.goals || b.assists - a.assists;
      if (category === 'asistencias') return b.assists - a.assists || b.goals - a.goals;
      return b.yellowCards + b.redCards * 3 - (a.yellowCards + a.redCards * 3);
    });
  }, [players, category]);

  return (
    <section
      aria-label="Estadísticas individuales de LigaPro Serie A"
      className="rounded-2xl border border-[#E2E8F0] bg-white"
    >
      <div className="flex flex-col gap-4 border-b border-[#E2E8F0] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F172A]">
            Estadísticas Individuales · Serie A 2026
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Líderes oficiales de goleo, asistencias y registro disciplinario.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Categoría de estadísticas"
          className="flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1"
        >
          {(
            [
              { id: 'goles', label: 'Goleadores' },
              { id: 'asistencias', label: 'Asistencias' },
              { id: 'disciplina', label: 'Disciplina' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={category === tab.id}
              onClick={() => setCategory(tab.id)}
              className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                category === tab.id
                  ? 'bg-[#1E3A8A] text-white'
                  : 'text-slate-700 hover:bg-white hover:text-[#1E3A8A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-slate-600">
              <th scope="col" className="py-3 pl-5 pr-2 w-12">
                #
              </th>
              <th scope="col" className="py-3 px-3">
                Jugador
              </th>
              <th scope="col" className="py-3 px-3">
                Club
              </th>
              <th scope="col" className="py-3 px-3 text-right font-mono-tabular">
                PJ
              </th>
              <th scope="col" className="py-3 px-3 text-right font-mono-tabular">
                Goles
              </th>
              <th scope="col" className="py-3 px-3 text-right font-mono-tabular">
                Asist.
              </th>
              <th scope="col" className="py-3 pl-3 pr-5 text-right font-mono-tabular">
                TA / TR
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] text-sm">
            {sortedPlayers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : sortedPlayers.map((player, idx) => {
              const club = clubMap.get(player.clubId);
              return (
                <tr key={player.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 pl-5 pr-2 font-mono-tabular font-semibold text-slate-600">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-[#0F172A]">{player.name}</p>
                    <p className="text-xs text-slate-500">
                      #{player.number} · {player.position}
                    </p>
                  </td>
                  <td className="py-3.5 px-3">
                    {club && (
                      <div className="flex items-center gap-2.5">
                        <ClubBadge club={club} size="sm" />
                        <span className="font-medium text-slate-700">
                          {club.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono-tabular text-slate-700">
                    {player.matches}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono-tabular font-bold text-[#1E3A8A]">
                    {player.goals}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono-tabular font-semibold text-[#047857]">
                    {player.assists}
                  </td>
                  <td className="py-3.5 pl-3 pr-5 text-right font-mono-tabular text-slate-700">
                    {player.yellowCards} / {player.redCards}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
