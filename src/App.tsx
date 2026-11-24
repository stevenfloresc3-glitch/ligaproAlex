/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { ActasView } from './components/ActasView';
import { ClubsView, StatsView } from './components/ClubsStatsView';
import { DashboardShell } from './components/DashboardShell';
import { FixtureView } from './components/FixtureView';
import { OverviewView } from './components/OverviewView';
import { NeonAuthDialog, NeonUser } from './components/NeonAuthDialog';
import { ProfileView } from './components/ProfileView';
import { PronosticosView } from './components/PronosticosView';
import { StandingsView } from './components/StandingsView';
import { authClient } from './lib/auth';
import {
  INITIAL_CLUBS,
  INITIAL_MATCHES,
  OFFICIAL_RESOLUTIONS,
  PLAYER_STATS,
} from './data/ligaProData';
import { AuthSession, Match, NavSection } from './types/tournament';

export default function App() {
  const session: AuthSession = {
    role: 'publico',
    name: 'Consulta pública',
    email: 'Vista de demostración',
    roleLabel: 'Solo lectura',
    readOnly: true,
  };
  const authConfigured = Boolean(authClient);
  const [authUser, setAuthUser] = useState<NeonUser | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('ligapro-theme') === 'dark'; } catch { return false; }
  });
  const [activeSection, setActiveSection] = useState<NavSection>('resumen');
  const [clubs, setClubs] = useState(INITIAL_CLUBS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [isLiveData, setIsLiveData] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    try { localStorage.setItem('ligapro-theme', isDarkMode ? 'dark' : 'light'); } catch { /* Theme still works for this session. */ }
  }, [isDarkMode]);

  useEffect(() => {
    let active = true;
    if (!authUser) return () => { active = false; };
    fetch('/api/data')
      .then(async (response) => {
        if (!response.ok) throw new Error('Neon API no disponible');
        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        if (Array.isArray(payload.clubs)) {
          const standings = new Map<string, Record<string, unknown>>(
            (payload.standings ?? []).map((row: Record<string, unknown>) => [String(row.club_id), row])
          );
          setClubs(payload.clubs.map((row: Record<string, unknown>) => {
            const stat = standings.get(String(row.id)) ?? {};
            const name = String(row.name ?? 'Club');
            const fallback = INITIAL_CLUBS.find((club) => club.name.toLowerCase() === name.toLowerCase());
            return {
              id: String(row.id), name, shortName: String(row.short_name ?? name.slice(0, 3).toUpperCase()),
              city: String(row.city ?? fallback?.city ?? ''), stadium: String(row.stadium ?? fallback?.stadium ?? 'Por confirmar'),
              coach: fallback?.coach ?? '—', primaryColor: fallback?.primaryColor ?? '#1E3A8A', secondaryColor: fallback?.secondaryColor ?? '#10B981',
              pj: Number(stat.pj ?? 0), pg: Number(stat.pg ?? 0), pe: Number(stat.pe ?? 0), pp: Number(stat.pp ?? 0),
              gf: Number(stat.gf ?? 0), gc: Number(stat.gc ?? 0), form: fallback?.form ?? [],
            };
          }));
        }
        if (Array.isArray(payload.matches)) {
          setMatches(payload.matches.map((row: Record<string, unknown>) => {
            const kickoff = new Date(String(row.kickoff_at));
            const rawStatus = String(row.status ?? '').toLowerCase();
            const status = rawStatus.includes('final') ? 'Finalizado' : rawStatus.includes('curso') ? 'En curso' : 'Programado';
            return {
              id: String(row.id), matchday: Number(row.round_number ?? 1), date: Number.isNaN(kickoff.getTime()) ? '' : kickoff.toISOString().slice(0, 10),
              time: Number.isNaN(kickoff.getTime()) ? 'Por definir' : kickoff.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
              stadium: String(row.stadium ?? 'Por definir'), city: String(row.city ?? ''), homeClubId: String(row.home_club_id), awayClubId: String(row.away_club_id),
              homeScore: row.home_goals == null ? null : Number(row.home_goals), awayScore: row.away_goals == null ? null : Number(row.away_goals), status,
              referee: 'Por asignar', comisario: 'Por asignar', actaStatus: 'Pendiente',
            };
          }));
        }
        setIsLiveData(true);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [authUser]);

  const handleSignOut = async () => {
    if (!authClient) return;
    try {
      await authClient.signOut();
      setAuthUser(null);
    } catch {
      // Keep the session indicator if Neon could not complete sign-out.
    }
  };

  if (!authUser) {
    return <NeonAuthDialog required onClose={() => undefined} onAuthenticated={setAuthUser} />;
  }

  const handleUpdateMatch = (updatedMatch: Match) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
  };

  const handleApproveActa = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, actaStatus: 'Aprobada' } : m
      )
    );
  };

  return (
    <>
    <DashboardShell
      session={session}
      dataIsLive={isLiveData}
      authUser={authUser}
      authConfigured={authConfigured}
      onOpenAuth={() => undefined}
      onSignOut={handleSignOut}
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode((current) => !current)}
      activeSection={activeSection}
      onSelectSection={setActiveSection}
    >
      {activeSection === 'resumen' && (
        <OverviewView
          session={session}
          clubs={clubs}
          matches={matches}
          players={PLAYER_STATS}
          resolutions={OFFICIAL_RESOLUTIONS}
          onNavigate={setActiveSection}
          onOpenAuth={() => undefined}
          isAuthenticated={Boolean(authUser)}
        />
      )}

      {activeSection === 'posiciones' && (
        <StandingsView clubs={clubs} />
      )}

      {activeSection === 'fixture' && (
        <FixtureView
          matches={matches}
          clubs={clubs}
          session={session}
          onUpdateMatch={handleUpdateMatch}
        />
      )}

      {activeSection === 'clubes' && (
        <ClubsView clubs={clubs} players={PLAYER_STATS} />
      )}

      {activeSection === 'estadisticas' && (
        <StatsView players={PLAYER_STATS} clubs={clubs} />
      )}

      {activeSection === 'actas' && (
        <ActasView
          session={session}
          matches={matches}
          clubs={clubs}
          resolutions={OFFICIAL_RESOLUTIONS}
          onApproveActa={handleApproveActa}
          onJumpToFixture={() => setActiveSection('fixture')}
        />
      )}

      {activeSection === 'pronosticos' && (
        <PronosticosView matches={matches} clubs={clubs} userId={authUser.id} />
      )}

      {activeSection === 'perfil' && (
        <ProfileView user={authUser} session={session} onSignOut={handleSignOut} />
      )}
    </DashboardShell>
    </>
  );
}
