import React, { useMemo } from 'react';
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  LogIn,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import {
  AuthSession,
  Club,
  Match,
  NavSection,
  OfficialResolution,
  PlayerStat,
} from '../types/tournament';
import { ClubBadge } from './ClubBadge';
import { StandingsView } from './StandingsView';

interface OverviewViewProps {
  session: AuthSession;
  clubs: Club[];
  matches: Match[];
  players: PlayerStat[];
  resolutions: OfficialResolution[];
  onNavigate: (section: NavSection) => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  session,
  clubs,
  matches,
  players,
  resolutions,
  onNavigate,
  onOpenAuth,
  isAuthenticated,
}) => {
  const clubMap = useMemo(() => {
    const map = new Map<string, Club>();
    clubs.forEach((c) => map.set(c.id, c));
    return map;
  }, [clubs]);

  const totalGoals = useMemo(
    () => clubs.reduce((acc, c) => acc + c.gf, 0),
    [clubs]
  );
  const totalMatchesPlayed = useMemo(
    () => clubs.reduce((acc, c) => acc + c.pj, 0) / 2,
    [clubs]
  );
  const goalsPerMatch =
    totalMatchesPlayed > 0
      ? (totalGoals / totalMatchesPlayed).toFixed(2)
      : '0.00';

  const featuredMatches = matches.filter((m) => m.matchday === 14).slice(0, 4);
  const topScorers = [...players]
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 5);
  const pendingActasCount = matches.filter(
    (m) => m.actaStatus !== 'Aprobada'
  ).length;

  return (
    <div className="space-y-6">
      {/* Encabezado contextual */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#047857]">
            LigaPro Ecuador · Temporada 2026
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#0F172A]">
            {session.readOnly
              ? 'Centro Público de Información Deportiva'
              : `Panel Operativo · ${session.roleLabel}`}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {session.readOnly
              ? 'Consulta en tiempo real de tabla de posiciones, calendario oficial y estadísticas.'
              : `Sesión iniciada como ${session.name}. Herramientas de gestión habilitadas según tu rol.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('fixture')}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-semibold text-white whitespace-nowrap hover:bg-[#172E6E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>Ver Fecha 14</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('estadisticas')}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2.5 text-xs font-semibold text-[#0F172A] whitespace-nowrap hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
          >
            <Trophy className="h-4 w-4 text-[#047857]" aria-hidden="true" />
            <span>Goleadores</span>
          </button>
        </div>
      </div>

      {/* Cuadrícula KPI de 4 columnas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-600">Clubes Serie A</p>
          <p className="mt-2 font-mono-tabular text-2xl sm:text-3xl font-bold text-[#0F172A]">
            {clubs.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Fase Inicial 2026</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-600">Jornada Actual</p>
          <p className="mt-2 font-mono-tabular text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
            Fecha 14
          </p>
          <p className="mt-1 text-xs text-[#047857] font-medium">
            En desarrollo
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-600">
            Partidos Jugados
          </p>
          <p className="mt-2 font-mono-tabular text-2xl sm:text-3xl font-bold text-[#0F172A]">
            {Math.round(totalMatchesPlayed)}
          </p>
          <p className="mt-1 text-xs text-slate-500">de 240 programados</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-slate-600">
            Promedio de Goles
          </p>
          <p className="mt-2 font-mono-tabular text-2xl sm:text-3xl font-bold text-[#0F172A]">
            {goalsPerMatch}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {totalGoals} goles totales
          </p>
        </div>
      </div>

      {/* Rejilla principal de múltiples columnas en computadora */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Columna principal (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Partidos destacados de Fecha 14 */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0F172A]">
                  Jornada 14 · Encuentros Destacados
                </h2>
                <p className="text-xs text-slate-600">
                  Resultados recientes y programación oficial del fin de semana
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('fixture')}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 whitespace-nowrap"
              >
                <span>Ver todo</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {featuredMatches.map((match) => {
                const home = clubMap.get(match.homeClubId);
                const away = clubMap.get(match.awayClubId);
                if (!home || !away) return null;

                return (
                  <div
                    key={match.id}
                    className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-mono-tabular">
                        {match.date} · {match.time}
                      </span>
                      <span
                        className={`font-semibold ${
                          match.status === 'En curso'
                            ? 'text-[#047857]'
                            : match.status === 'Finalizado'
                            ? 'text-[#1E3A8A]'
                            : 'text-slate-600'
                        }`}
                      >
                        {match.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <ClubBadge club={home} size="sm" />
                          <span className="text-sm font-semibold text-[#0F172A] truncate">
                            {home.name}
                          </span>
                        </div>
                        <span className="font-mono-tabular text-base font-bold text-[#0F172A]">
                          {match.homeScore !== null ? match.homeScore : '–'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <ClubBadge club={away} size="sm" />
                          <span className="text-sm font-semibold text-[#0F172A] truncate">
                            {away.name}
                          </span>
                        </div>
                        <span className="font-mono-tabular text-base font-bold text-[#0F172A]">
                          {match.awayScore !== null ? match.awayScore : '–'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Vista previa Tabla de Posiciones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-lg font-bold text-[#0F172A]">
                Primeros 6 Puestos · Serie A
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('posiciones')}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 whitespace-nowrap"
              >
                <span>Tabla completa (16)</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <StandingsView clubs={clubs} compact />
          </div>
        </div>

        {/* Columna lateral derecha (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Tarjeta contextual de Rol */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-[#1E3A8A]" aria-hidden="true" />
              <h2 className="font-display text-base font-bold text-[#0F172A]">
                {session.readOnly ? 'Acceso Solo Lectura' : 'Acciones de tu Rol'}
              </h2>
            </div>

            {session.readOnly ? (
              <div className="mt-3 space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  {isAuthenticated ? <>Tu sesión está activa como <span className="font-semibold text-[#0F172A]">Público / Prensa</span>. Puedes consultar la información y participar en los pronósticos con créditos virtuales.</> : <>Navegas como <span className="font-semibold text-[#0F172A]">Público / Prensa</span>. Puedes consultar tablas, fixture, clubes, goleadores y boletines oficiales.</>}
                </p>
                <button
                  type="button"
                  onClick={isAuthenticated ? () => onNavigate('pronosticos') : onOpenAuth}
                  className={`min-h-[46px] w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${isAuthenticated ? 'bg-[#047857] hover:bg-[#065F46]' : 'bg-[#1E3A8A] hover:bg-[#172E6E]'}`}
                >
                  {isAuthenticated ? <ClipboardList className="h-4 w-4" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
                  <span>{isAuthenticated ? 'Ir a pronósticos' : 'Ingresar con cuenta oficial'}</span>
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  {session.role === 'admin' &&
                    `Tienes ${pendingActasCount} actas pendientes de revisión o aprobación final en el sistema.`}
                  {session.role === 'comisario' &&
                    'Puedes registrar marcadores finales, asistencia oficial e incidencias en la Fecha 14.'}
                  {session.role === 'delegado' &&
                    'Prepara y confirma la nómina de jugadores habilitados de Barcelona SC para la Fecha 15.'}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(session.role === 'comisario' ? 'fixture' : 'actas')
                  }
                  className="min-h-[46px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#047857] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#065F46]"
                >
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {session.role === 'admin' && 'Revisar actas pendientes'}
                    {session.role === 'comisario' && 'Registrar acta de partido'}
                    {session.role === 'delegado' && 'Gestionar nómina oficial'}
                  </span>
                </button>
              </div>
            )}
          </section>

          {/* Líderes de Goleo */}
          <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h2 className="font-display text-base font-bold text-[#0F172A]">
                Tabla de Goleadores
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('estadisticas')}
                className="text-xs font-semibold text-[#1E3A8A] hover:underline"
              >
                Ver más
              </button>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {topScorers.map((player, index) => {
                const club = clubMap.get(player.clubId);
                return (
                  <li
                    key={player.id}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono-tabular text-xs font-semibold text-slate-500 w-4">
                        {index + 1}
                      </span>
                      {club && <ClubBadge club={club} size="sm" />}
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0F172A] truncate">
                          {player.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {club?.shortName} · {player.matches} PJ
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-base font-bold text-[#1E3A8A] shrink-0">
                      {player.goals}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Última resolución oficial */}
          {resolutions[0] && (
            <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
              <p className="text-xs font-semibold text-[#1E3A8A]">
                {resolutions[0].code} · {resolutions[0].date}
              </p>
              <h3 className="mt-1.5 font-display text-sm font-bold text-[#0F172A]">
                {resolutions[0].title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {resolutions[0].summary}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('actas')}
                className="mt-3 min-h-[40px] text-xs font-semibold text-[#1E3A8A] hover:underline"
              >
                Consultar boletines oficiales
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
