import React, { useMemo, useState } from 'react';
import { CheckCircle2, FileCheck2, FileText, ShieldAlert } from 'lucide-react';
import {
  AuthSession,
  Club,
  Match,
  OfficialResolution,
} from '../types/tournament';

interface ActasViewProps {
  session: AuthSession;
  matches: Match[];
  clubs: Club[];
  resolutions: OfficialResolution[];
  onApproveActa: (matchId: string) => void;
  onJumpToFixture: () => void;
}

const DELEGADO_SQUAD_DEFAULT = [
  { id: 'sq1', number: 1, name: 'Javier Burrai', pos: 'Arquero', selected: true },
  { id: 'sq2', number: 3, name: 'Luca Sosa', pos: 'Defensa', selected: true },
  { id: 'sq3', number: 2, name: 'Mario Pineida', pos: 'Defensa', selected: true },
  { id: 'sq4', number: 5, name: 'Jesús Trindade', pos: 'Mediocampista', selected: true },
  { id: 'sq5', number: 8, name: 'Leonai Souza', pos: 'Mediocampista', selected: true },
  { id: 'sq6', number: 13, name: 'Janner Corozo', pos: 'Mediocampista', selected: true },
  { id: 'sq7', number: 29, name: 'Octavio Rivero', pos: 'Delantero', selected: true },
  { id: 'sq8', number: 11, name: 'Joao Rojas', pos: 'Delantero', selected: false },
];

export const ActasView: React.FC<ActasViewProps> = ({
  session,
  matches,
  clubs,
  resolutions,
  onApproveActa,
  onJumpToFixture,
}) => {
  const [squad, setSquad] = useState(DELEGADO_SQUAD_DEFAULT);
  const [nominaSubmitted, setNominaSubmitted] = useState(false);

  const clubMap = useMemo(() => {
    const map = new Map<string, Club>();
    clubs.forEach((c) => map.set(c.id, c));
    return map;
  }, [clubs]);

  const reviewQueue = matches.filter(
    (m) => m.actaStatus === 'En revisión' || m.actaStatus === 'Pendiente'
  );

  const togglePlayer = (id: string) => {
    setNominaSubmitted(false);
    setSquad((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectedCount = squad.filter((p) => p.selected).length;

  return (
    <div className="space-y-6">
      {/* Bloque operativo por rol (Admin, Comisario o Delegado) */}
      {session.role === 'delegado' && (
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-[#E2E8F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F172A]">
                Nómina Oficial de Partido · Barcelona SC
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                Fecha 15 vs. Independiente del Valle · Habilitación reglamentaria de convocados.
              </p>
            </div>
            <span className="font-mono-tabular text-sm font-bold text-[#1E3A8A]">
              {selectedCount} / {squad.length} habilitados
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {squad.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                aria-pressed={player.selected}
                className={`flex min-h-[48px] items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                  player.selected
                    ? 'border-[#047857]/40 bg-emerald-50/60 text-[#0F172A]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-slate-600'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">
                    #{player.number} {player.name}
                  </p>
                  <p className="text-xs text-slate-500">{player.pos}</p>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    player.selected ? 'text-[#047857]' : 'text-slate-500'
                  }`}
                >
                  {player.selected ? 'Convocado' : 'No convocado'}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {nominaSubmitted ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-[#047857]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Nómina oficial enviada al Comisario de Partido.</span>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                La lista oficial cierra 90 minutos antes del inicio del compromiso.
              </p>
            )}
            <button
              type="button"
              onClick={() => setNominaSubmitted(true)}
              className="min-h-[46px] rounded-xl bg-[#1E3A8A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#172E6E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
            >
              Confirmar y enviar nómina
            </button>
          </div>
        </section>
      )}

      {(session.role === 'admin' || session.role === 'comisario') && (
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-[#E2E8F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F172A]">
                Control de Actas de Partido · Fecha 14
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">
                {session.role === 'admin'
                  ? 'Revisa observaciones y aprueba las actas cerradas por los comisarios.'
                  : 'Encuentros pendientes de cierre de acta oficial e informe arbitral.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onJumpToFixture}
              className="min-h-[44px] rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-4 py-2 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50"
            >
              Ir al Fixture completo
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#E2E8F0]">
            {reviewQueue.slice(0, 6).map((m) => {
              const home = clubMap.get(m.homeClubId);
              const away = clubMap.get(m.awayClubId);
              if (!home || !away) return null;

              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display text-sm font-bold text-[#0F172A]">
                      Fecha {m.matchday} · {home.name} vs. {away.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Comisario: {m.comisario} · Estado partido: {m.status} · Acta:{' '}
                      <span
                        className={`font-semibold ${
                          m.actaStatus === 'En revisión'
                            ? 'text-amber-800'
                            : 'text-slate-700'
                        }`}
                      >
                        {m.actaStatus}
                      </span>
                    </p>
                    {m.observations && (
                      <p className="mt-1 text-xs text-slate-700">
                        Nota: {m.observations}
                      </p>
                    )}
                  </div>

                  {session.role === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => onApproveActa(m.id)}
                      className="min-h-[44px] shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#047857] px-4 py-2 text-xs font-semibold text-white hover:bg-[#065F46]"
                    >
                      <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                      <span>Aprobar acta</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onJumpToFixture}
                      className="min-h-[44px] shrink-0 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#172E6E]"
                    >
                      Completar en Fixture
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Resoluciones y Boletines Públicos */}
      <section
        aria-label="Resoluciones oficiales del torneo"
        className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6"
      >
        <div className="border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#1E3A8A]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              Boletines y Resoluciones Oficiales
            </h2>
          </div>
          <p className="mt-0.5 text-sm text-slate-600">
            Comunicados emitidos por Dirección de Competiciones, Comité Disciplinario y Comisión Arbitral.
          </p>
        </div>

        <div className="mt-4 divide-y divide-[#E2E8F0]">
          {resolutions.map((res) => (
            <article key={res.id} className="py-4 first:pt-2 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span className="font-mono-tabular font-semibold text-[#1E3A8A]">
                  {res.code} · {res.category}
                </span>
                <span className="font-mono-tabular">
                  {res.date} · {res.status}
                </span>
              </div>
              <h3 className="mt-1.5 font-display text-base font-bold text-[#0F172A]">
                {res.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {res.summary}
              </p>
            </article>
          ))}
        </div>

        {session.readOnly && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs text-slate-700">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A8A]" aria-hidden="true" />
            <span>
              Modo Público / Prensa activo: visualizas resoluciones públicas certificadas. La edición de actas y nóminas requiere acceso institucional acreditado.
            </span>
          </div>
        )}
      </section>
    </div>
  );
};
