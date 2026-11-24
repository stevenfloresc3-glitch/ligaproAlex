import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, ClipboardEdit, Eye, MapPin, X } from 'lucide-react';
import {
  ActaStatus,
  AuthSession,
  Club,
  Match,
  MatchStatus,
} from '../types/tournament';
import { ClubBadge } from './ClubBadge';

interface FixtureViewProps {
  matches: Match[];
  clubs: Club[];
  session: AuthSession;
  onUpdateMatch: (updated: Match) => void;
}

export const FixtureView: React.FC<FixtureViewProps> = ({
  matches,
  clubs,
  session,
  onUpdateMatch,
}) => {
  const [selectedMatchday, setSelectedMatchday] = useState<number>(14);
  const [statusFilter, setStatusFilter] = useState<'all' | MatchStatus>('all');
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);

  // Modal edit form state for Admin / Comisario
  const [homeScoreInput, setHomeScoreInput] = useState<string>('');
  const [awayScoreInput, setAwayScoreInput] = useState<string>('');
  const [matchStatusInput, setMatchStatusInput] = useState<MatchStatus>('Programado');
  const [actaStatusInput, setActaStatusInput] = useState<ActaStatus>('Pendiente');
  const [attendanceInput, setAttendanceInput] = useState<string>('');
  const [observationsInput, setObservationsInput] = useState<string>('');

  const canEditActa = session.role === 'admin' || session.role === 'comisario';

  const clubMap = useMemo(() => {
    const map = new Map<string, Club>();
    clubs.forEach((c) => map.set(c.id, c));
    return map;
  }, [clubs]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchesDay = m.matchday === selectedMatchday;
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesDay && matchesStatus;
    });
  }, [matches, selectedMatchday, statusFilter]);

  const openMatchModal = (match: Match) => {
    setActiveMatch(match);
    setHomeScoreInput(match.homeScore !== null ? String(match.homeScore) : '');
    setAwayScoreInput(match.awayScore !== null ? String(match.awayScore) : '');
    setMatchStatusInput(match.status);
    setActaStatusInput(match.actaStatus);
    setAttendanceInput(match.attendance ? String(match.attendance) : '');
    setObservationsInput(match.observations ?? '');
  };

  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;

    const parsedHome =
      homeScoreInput.trim() === '' ? null : Math.max(0, Number(homeScoreInput));
    const parsedAway =
      awayScoreInput.trim() === '' ? null : Math.max(0, Number(awayScoreInput));
    const parsedAttendance =
      attendanceInput.trim() === '' ? undefined : Math.max(0, Number(attendanceInput));

    onUpdateMatch({
      ...activeMatch,
      homeScore: parsedHome,
      awayScore: parsedAway,
      status: matchStatusInput,
      actaStatus: actaStatusInput,
      attendance: parsedAttendance,
      observations: observationsInput.trim() || undefined,
    });
    setActiveMatch(null);
  };

  return (
    <section aria-label="Fixture y Resultados LigaPro" className="space-y-5">
      {/* Barra de controles */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Fixture y Resultados Oficiales
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              {canEditActa
                ? 'Modo operativo habilitado: puedes registrar marcadores y actas oficiales.'
                : 'Consulta de calendario, horarios, estadios y marcadores oficiales.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de jornada */}
            <div
              role="group"
              aria-label="Seleccionar jornada"
              className="flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1"
            >
              {[13, 14, 15].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedMatchday(day)}
                  className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                    selectedMatchday === day
                      ? 'bg-[#1E3A8A] text-white'
                      : 'text-slate-700 hover:bg-white hover:text-[#1E3A8A]'
                  }`}
                >
                  Fecha {day}
                </button>
              ))}
            </div>

            {/* Filtro por estado */}
            <div
              role="group"
              aria-label="Filtrar por estado"
              className="flex items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1 overflow-x-auto"
            >
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'Finalizado', label: 'Finalizados' },
                  { id: 'En curso', label: 'En curso' },
                  { id: 'Programado', label: 'Programados' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`min-h-[40px] rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                    statusFilter === tab.id
                      ? 'bg-white text-[#0F172A] shadow-xs border border-[#E2E8F0]'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cuadrícula de partidos */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            No hay encuentros con el filtro seleccionado en la Fecha {selectedMatchday}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredMatches.map((match) => {
            const home = clubMap.get(match.homeClubId);
            const away = clubMap.get(match.awayClubId);
            if (!home || !away) return null;

            const isLive = match.status === 'En curso';
            const isDone = match.status === 'Finalizado';

            return (
              <article
                key={match.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-colors hover:border-slate-300"
              >
                {/* Metadatos limpios sin pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                    <span className="font-mono-tabular">
                      {match.date} · {match.time}
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      isLive
                        ? 'text-[#047857]'
                        : isDone
                        ? 'text-[#1E3A8A]'
                        : 'text-slate-600'
                    }`}
                  >
                    {match.status} · Acta {match.actaStatus}
                  </span>
                </div>

                {/* Equipos y marcador */}
                <div className="my-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ClubBadge club={home} size="md" />
                      <div className="min-w-0">
                        <p className="font-display text-sm font-bold text-[#0F172A] truncate">
                          {home.name}
                        </p>
                        <p className="text-xs text-slate-500">Local</p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-2xl font-bold text-[#0F172A] w-8 text-right">
                      {match.homeScore !== null ? match.homeScore : '–'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ClubBadge club={away} size="md" />
                      <div className="min-w-0">
                        <p className="font-display text-sm font-bold text-[#0F172A] truncate">
                          {away.name}
                        </p>
                        <p className="text-xs text-slate-500">Visitante</p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-2xl font-bold text-[#0F172A] w-8 text-right">
                      {match.awayScore !== null ? match.awayScore : '–'}
                    </span>
                  </div>
                </div>

                {/* Estadio y botón táctil amplio */}
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 min-w-0">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                    <span className="truncate">
                      {match.stadium} · {match.city}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openMatchModal(match)}
                    className={`min-h-[44px] shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                      canEditActa
                        ? 'bg-[#1E3A8A] text-white hover:bg-[#172E6E]'
                        : 'border border-[#CBD5E1] bg-[#F8FAFC] text-[#1E3A8A] hover:bg-blue-50'
                    }`}
                  >
                    {canEditActa ? (
                      <>
                        <ClipboardEdit className="h-4 w-4" aria-hidden="true" />
                        <span>Registrar acta</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        <span>Ver ficha oficial</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Ficha o Registro de Acta */}
      {activeMatch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="match-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <p className="text-xs font-semibold text-[#047857]">
                  Fecha {activeMatch.matchday} · {activeMatch.date} · {activeMatch.time}
                </p>
                <h3
                  id="match-modal-title"
                  className="mt-1 font-display text-lg font-bold text-[#0F172A]"
                >
                  {clubMap.get(activeMatch.homeClubId)?.name} vs.{' '}
                  {clubMap.get(activeMatch.awayClubId)?.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  {activeMatch.stadium} · {activeMatch.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMatch(null)}
                aria-label="Cerrar ventana"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {canEditActa ? (
              <form onSubmit={handleSaveMatch} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="home-score"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Goles {clubMap.get(activeMatch.homeClubId)?.shortName}
                    </label>
                    <input
                      id="home-score"
                      type="number"
                      min={0}
                      max={20}
                      value={homeScoreInput}
                      onChange={(e) => setHomeScoreInput(e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-[#CBD5E1] px-3 text-base font-mono-tabular font-bold text-[#0F172A] focus-visible:border-[#1E3A8A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/25"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="away-score"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Goles {clubMap.get(activeMatch.awayClubId)?.shortName}
                    </label>
                    <input
                      id="away-score"
                      type="number"
                      min={0}
                      max={20}
                      value={awayScoreInput}
                      onChange={(e) => setAwayScoreInput(e.target.value)}
                      className="min-h-[44px] w-full rounded-xl border border-[#CBD5E1] px-3 text-base font-mono-tabular font-bold text-[#0F172A] focus-visible:border-[#1E3A8A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/25"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="match-status-select"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Estado del encuentro
                    </label>
                    <select
                      id="match-status-select"
                      value={matchStatusInput}
                      onChange={(e) => setMatchStatusInput(e.target.value as MatchStatus)}
                      className="min-h-[44px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] focus-visible:border-[#1E3A8A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/25"
                    >
                      <option value="Programado">Programado</option>
                      <option value="En curso">En curso</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="acta-status-select"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Estado de Acta
                    </label>
                    <select
                      id="acta-status-select"
                      value={actaStatusInput}
                      onChange={(e) => setActaStatusInput(e.target.value as ActaStatus)}
                      className="min-h-[44px] w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] focus-visible:border-[#1E3A8A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/25"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En revisión">En revisión</option>
                      <option value="Aprobada" disabled={session.role !== 'admin'}>
                        Aprobada {session.role !== 'admin' ? '(Solo Admin)' : ''}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="attendance-input"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Asistencia oficial registrada (espectadores)
                  </label>
                  <input
                    id="attendance-input"
                    type="number"
                    min={0}
                    value={attendanceInput}
                    onChange={(e) => setAttendanceInput(e.target.value)}
                    placeholder="Ej. 18500"
                    className="min-h-[44px] w-full rounded-xl border border-[#CBD5E1] px-3 text-sm font-mono-tabular text-[#0F172A] focus-visible:border-[#1E3A8A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/25"
                  />
                </div>

                <div>
                  <label
                    htmlFor="observations-input"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Observaciones del Comisario / Incidencias
                  </label>
                  <textarea
                    id="observations-input"
                    rows={3}
                    value={observationsInput}
                    onChange={(e) => setObservationsInput(e.target.value)}
                    placeholder="Detalle novedades reglamentarias, ingreso de público o informe arbitral..."
                    className="w-full rounded-xl border border-[#CBD5E1] p-3 text-sm text-[#0F172A] focus-visible:border-[#1E3A8A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/25"
                  />
                </div>

                <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveMatch(null)}
                    className="min-h-[46px] rounded-xl border border-[#CBD5E1] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#172E6E]"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Guardar acta oficial</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-3 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-center">
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      {clubMap.get(activeMatch.homeClubId)?.shortName}
                    </p>
                    <p className="mt-1 font-mono-tabular text-3xl font-bold text-[#0F172A]">
                      {activeMatch.homeScore !== null ? activeMatch.homeScore : '–'}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {activeMatch.status}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      {clubMap.get(activeMatch.awayClubId)?.shortName}
                    </p>
                    <p className="mt-1 font-mono-tabular text-3xl font-bold text-[#0F172A]">
                      {activeMatch.awayScore !== null ? activeMatch.awayScore : '–'}
                    </p>
                  </div>
                </div>

                <dl className="divide-y divide-slate-100 text-sm">
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-600">Árbitro central</dt>
                    <dd className="font-semibold text-[#0F172A]">{activeMatch.referee}</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-600">Comisario designado</dt>
                    <dd className="font-semibold text-[#0F172A]">{activeMatch.comisario}</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-600">Estado de acta</dt>
                    <dd className="font-semibold text-[#1E3A8A]">{activeMatch.actaStatus}</dd>
                  </div>
                  {activeMatch.attendance && (
                    <div className="flex justify-between py-2.5">
                      <dt className="text-slate-600">Asistencia oficial</dt>
                      <dd className="font-mono-tabular font-semibold text-[#0F172A]">
                        {activeMatch.attendance.toLocaleString('es-EC')} espectadores
                      </dd>
                    </div>
                  )}
                </dl>

                {activeMatch.observations && (
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-xs leading-relaxed text-slate-700">
                    <span className="font-semibold text-[#0F172A]">
                      Nota oficial del comisario:{' '}
                    </span>
                    {activeMatch.observations}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveMatch(null)}
                  className="min-h-[46px] w-full rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#172E6E]"
                >
                  Cerrar ficha
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
