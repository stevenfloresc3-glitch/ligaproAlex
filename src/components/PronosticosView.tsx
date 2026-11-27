import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, CircleDollarSign, RotateCcw, Save, ShieldCheck, TicketCheck, TrendingUp, Wallet } from 'lucide-react';
import { Club, Match } from '../types/tournament';
import { ClubBadge } from './ClubBadge';

type Score = { home: number | null; away: number | null };
type Predictions = Record<string, Score>;
type BetPick = 'home' | 'draw' | 'away';
type BetTicket = {
  id: string;
  matchId: string;
  pick: BetPick;
  stake: number;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
};
type WalletState = { balance: number; bets: BetTicket[] };

const INITIAL_CREDITS = 1000;

function readPredictions(key: string): Predictions {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as Predictions : {};
  } catch {
    return {};
  }
}

function readWallet(key: string): WalletState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { balance: INITIAL_CREDITS, bets: [] };
    const parsed = JSON.parse(raw) as Partial<WalletState>;
    return {
      balance: Number.isFinite(parsed.balance) ? Math.max(0, Number(parsed.balance)) : INITIAL_CREDITS,
      bets: Array.isArray(parsed.bets) ? parsed.bets.filter((bet): bet is BetTicket =>
        Boolean(bet && typeof bet.id === 'string' && typeof bet.matchId === 'string' &&
          ['home', 'draw', 'away'].includes(bet.pick) && Number.isFinite(bet.stake) &&
          Number.isFinite(bet.odds) && ['pending', 'won', 'lost'].includes(bet.status))
      ) : [],
    };
  } catch {
    return { balance: INITIAL_CREDITS, bets: [] };
  }
}

function getOdds(home: Club, away: Club): Record<BetPick, number> {
  const winRate = (club: Club) => club.pj > 0 ? (club.pg + club.pe * 0.5) / club.pj : 0.35;
  const homeStrength = Math.max(0.1, winRate(home) + 0.12 + (home.pj ? home.gf / home.pj * 0.025 : 0));
  const awayStrength = Math.max(0.1, winRate(away) + (away.pj ? away.gf / away.pj * 0.025 : 0));
  const draw = Math.min(0.32, Math.max(0.18, 0.30 - Math.abs(homeStrength - awayStrength) * 0.2));
  const homeProb = (1 - draw) * homeStrength / (homeStrength + awayStrength);
  const awayProb = 1 - draw - homeProb;
  const toOdds = (probability: number) => Math.max(1.15, Math.round((0.92 / probability) * 100) / 100);
  return { home: toOdds(homeProb), draw: toOdds(draw), away: toOdds(awayProb) };
}

function matchOutcome(match: Match): BetPick | null {
  if (match.homeScore == null || match.awayScore == null) return null;
  if (match.homeScore > match.awayScore) return 'home';
  if (match.homeScore < match.awayScore) return 'away';
  return 'draw';
}

interface PronosticosViewProps {
  matches: Match[];
  clubs: Club[];
  userId: string;
}

export const PronosticosView: React.FC<PronosticosViewProps> = ({ matches, clubs, userId }) => {
  const storageSuffix = encodeURIComponent(userId);
  const predictionKey = `ligapro-pronosticos-v2:${storageSuffix}`;
  const walletKey = `ligapro-billetera-v1:${storageSuffix}`;
  const [predictions, setPredictions] = useState<Predictions>(() => readPredictions(predictionKey));
  const [saved, setSaved] = useState(false);
  const [wallet, setWallet] = useState<WalletState>(() => readWallet(walletKey));
  const [selectedPick, setSelectedPick] = useState<BetPick | null>(null);
  const [stakeInput, setStakeInput] = useState('50');
  const [betNotice, setBetNotice] = useState('');
  const clubMap = useMemo(() => new Map(clubs.map((club) => [club.id, club])), [clubs]);
  const isBarcelona = (clubId: string) => clubMap.get(clubId)?.name.toLowerCase().includes('barcelona') ?? clubId === 'bsc';
  const upcomingMatches = useMemo(() => matches
    .filter((match) => match.status === 'Programado')
    .sort((a, b) => {
      const aHasBarcelona = isBarcelona(a.homeClubId) || isBarcelona(a.awayClubId);
      const bHasBarcelona = isBarcelona(b.homeClubId) || isBarcelona(b.awayClubId);
      if (aHasBarcelona !== bHasBarcelona) return aHasBarcelona ? -1 : 1;
      return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
    }), [matches, clubMap]);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const selectedMatch = upcomingMatches.find((match) => match.id === selectedMatchId) ?? upcomingMatches[0];
  const selectedHome = selectedMatch ? clubMap.get(selectedMatch.homeClubId) : undefined;
  const selectedAway = selectedMatch ? clubMap.get(selectedMatch.awayClubId) : undefined;
  const odds = selectedHome && selectedAway ? getOdds(selectedHome, selectedAway) : null;
  const stake = Number(stakeInput);
  const potentialPayout = selectedPick && odds && Number.isInteger(stake) ? Math.floor(stake * odds[selectedPick]) : 0;

  const rounds = useMemo(
    () => [...new Set(matches.filter((match) => match.status === 'Programado').map((match) => match.matchday ?? 0))].sort((a, b) => a - b),
    [matches],
  );
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const roundNumber = selectedRound !== null && rounds.includes(selectedRound) ? selectedRound : rounds[0];
  const roundMatches = matches.filter((match) => (match.matchday ?? 0) === roundNumber && match.status === 'Programado');

  useEffect(() => { localStorage.setItem(walletKey, JSON.stringify(wallet)); }, [wallet, walletKey]);

  useEffect(() => {
    setWallet((current) => {
      let balance = current.balance;
      let changed = false;
      const bets = current.bets.map((bet) => {
        if (bet.status !== 'pending') return bet;
        const match = matches.find((item) => item.id === bet.matchId);
        if (!match || match.status !== 'Finalizado') return bet;
        const outcome = matchOutcome(match);
        if (!outcome) return bet;
        changed = true;
        if (outcome === bet.pick) {
          const payout = Math.floor(bet.stake * bet.odds);
          balance += payout;
          return { ...bet, status: 'won' as const, payout };
        }
        return { ...bet, status: 'lost' as const, payout: 0 };
      });
      return changed ? { balance, bets } : current;
    });
  }, [matches]);

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
      club, pj: club.pj, pg: club.pg, pe: club.pe, pp: club.pp, gf: club.gf, gc: club.gc,
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
    const ranked = [...rows.values()].sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf || a.club.name.localeCompare(b.club.name, 'es'));
    const withRealPosition = ranked.map((row, index) => ({ ...row, realPosition: index + 1 }));
    return withRealPosition.sort((a, b) => {
      const aFavorite = isBarcelona(a.club.id);
      const bFavorite = isBarcelona(b.club.id);
      if (aFavorite !== bFavorite) return aFavorite ? -1 : 1;
      return a.realPosition - b.realPosition;
    });
  }, [clubs, predictions, roundMatches, clubMap]);

  const savePredictions = () => {
    try {
      localStorage.setItem(predictionKey, JSON.stringify(predictions));
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

  const placeBet = () => {
    if (!selectedMatch || !selectedPick || !odds || !Number.isInteger(stake) || stake < 10 || stake > wallet.balance) return;
    setWallet((current) => ({
      balance: current.balance - stake,
      bets: [{ id: crypto.randomUUID(), matchId: selectedMatch.id, pick: selectedPick, stake, odds: odds[selectedPick], status: 'pending' }, ...current.bets],
    }));
    setBetNotice(`Apuesta simulada por ${stake} créditos. Cobro potencial: ${potentialPayout} créditos.`);
    setSelectedPick(null);
  };

  const pickLabel = (bet: BetTicket) => {
    const match = matches.find((item) => item.id === bet.matchId);
    if (!match) return bet.pick === 'draw' ? 'Empate' : bet.pick === 'home' ? 'Local' : 'Visitante';
    if (bet.pick === 'draw') return 'Empate';
    return clubMap.get(bet.pick === 'home' ? match.homeClubId : match.awayClubId)?.name ?? (bet.pick === 'home' ? 'Local' : 'Visitante');
  };

  const completedCount = wallet.bets.filter((bet) => bet.status !== 'pending').length;
  const wonCount = wallet.bets.filter((bet) => bet.status === 'won').length;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-[#D9E2F0] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0B1739] via-[#132D68] to-[#1E3A8A] p-5 text-white sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"><CircleDollarSign className="h-4 w-4" /> Pronósticos de LigaPro</p>
              <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">Arma tu jugada</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">Elige un partido, pronostica el resultado y apuesta créditos virtuales. Las cuotas son estimadas por el simulador.</p>
            </div>
            <div className="min-w-48 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="flex items-center gap-2 text-xs font-semibold text-blue-100"><Wallet className="h-4 w-4" /> Saldo virtual</p>
              <p className="mt-1 font-mono text-3xl font-extrabold">{wallet.balance.toLocaleString('es-EC')} <span className="text-sm font-semibold text-emerald-300">cr</span></p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-blue-100/90">
            <span>{wallet.bets.filter((bet) => bet.status === 'pending').length} apuestas pendientes</span>
            <span>{completedCount ? `${wonCount} aciertos de ${completedCount} resueltas` : 'Aún no tienes apuestas resueltas'}</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Solo créditos de juego</span>
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr] sm:p-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0F172A]">Mercado 1X2</h2>
                <p className="text-xs text-slate-500">1: gana local · X: empate · 2: gana visitante</p>
              </div>
              {selectedMatch && (isBarcelona(selectedMatch.homeClubId) || isBarcelona(selectedMatch.awayClubId)) && <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-900">⭐ Barcelona primero</span>}
            </div>

            {upcomingMatches.length ? (
              <>
                <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="bet-match">Partido</label>
                <select id="bet-match" value={selectedMatch?.id ?? ''} onChange={(event) => { setSelectedMatchId(event.target.value); setSelectedPick(null); setBetNotice(''); }} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-blue-100">
                  {upcomingMatches.map((match) => {
                    const home = clubMap.get(match.homeClubId);
                    const away = clubMap.get(match.awayClubId);
                    if (!home || !away) return null;
                    const isBarcelonaMatch = isBarcelona(match.homeClubId) || isBarcelona(match.awayClubId);
                    return <option key={match.id} value={match.id}>{isBarcelonaMatch ? '⭐ ' : ''}{home.name} vs {away.name} · {match.matchday === null ? 'Fecha por asignar' : `Fecha ${match.matchday}`}</option>;
                  })}
                </select>

                {selectedMatch && selectedHome && selectedAway && odds && (
                  <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-slate-50 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><span>{selectedMatch.matchday === null ? 'Fecha por asignar' : `Fecha ${selectedMatch.matchday}`} · {selectedMatch.date || 'Por definir'} · {selectedMatch.time}</span><span>{selectedMatch.stadium}</span></div>
                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                      <div className="flex min-w-0 flex-col items-center gap-2 text-center"><ClubBadge club={selectedHome} size="lg" /><span className="text-sm font-bold text-slate-800">{selectedHome.name}</span></div>
                      <span className="font-display text-sm font-extrabold text-slate-400">VS</span>
                      <div className="flex min-w-0 flex-col items-center gap-2 text-center"><ClubBadge club={selectedAway} size="lg" /><span className="text-sm font-bold text-slate-800">{selectedAway.name}</span></div>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {([
                        ['home', '1', selectedHome.shortName],
                        ['draw', 'X', 'Empate'],
                        ['away', '2', selectedAway.shortName],
                      ] as const).map(([pick, code, label]) => {
                        const active = selectedPick === pick;
                        return (
                          <button key={pick} type="button" onClick={() => { setSelectedPick(pick); setBetNotice(''); }} aria-pressed={active} className={`min-h-[76px] rounded-xl border px-2 py-2 transition-colors ${active ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-md' : 'border-[#CBD5E1] bg-white text-slate-700 hover:border-[#1E3A8A] hover:bg-blue-50'}`}>
                            <span className="block text-lg font-extrabold">{code}</span><span className={`block truncate text-[11px] font-semibold ${active ? 'text-blue-100' : 'text-slate-500'}`}>{label}</span><span className={`mt-1 block font-mono text-sm font-bold ${active ? 'text-emerald-300' : 'text-[#047857]'}`}>{odds[pick].toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Créditos a apostar
                    <input type="number" min="10" step="10" max={wallet.balance} value={stakeInput} onChange={(event) => setStakeInput(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-[#CBD5E1] px-3 text-sm font-semibold text-slate-800 focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <button type="button" onClick={placeBet} disabled={!selectedPick || !Number.isInteger(stake) || stake < 10 || stake > wallet.balance || !odds} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#047857] px-5 text-sm font-bold text-white hover:bg-[#065F46] disabled:cursor-not-allowed disabled:opacity-45"><TicketCheck className="h-4 w-4" /> Confirmar jugada</button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm">
                  <span className="text-emerald-900">Cobro potencial <span className="text-xs text-emerald-700">(incluye tu apuesta)</span></span>
                  <strong className="font-mono text-base text-emerald-900">{potentialPayout.toLocaleString('es-EC')} cr</strong>
                </div>
                {betNotice && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{betNotice}</p>}
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] bg-slate-50 p-6 text-center text-sm text-slate-600">No hay partidos programados para apostar por ahora.</div>
            )}
          </div>

          <aside className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-display font-bold text-[#0F172A]">Mis jugadas</h3><p className="mt-0.5 text-xs text-slate-500">Historial de esta cuenta en este navegador</p></div><TicketCheck className="h-5 w-5 text-[#1E3A8A]" /></div>
            <div className="mt-4 space-y-3">
              {wallet.bets.length ? wallet.bets.slice(0, 6).map((bet) => {
                const match = matches.find((item) => item.id === bet.matchId);
                const home = match ? clubMap.get(match.homeClubId)?.shortName : 'Club';
                const away = match ? clubMap.get(match.awayClubId)?.shortName : 'Club';
                const statusStyle = bet.status === 'pending' ? 'bg-amber-100 text-amber-900' : bet.status === 'won' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-600';
                return <article key={bet.id} className="rounded-xl border border-[#E2E8F0] p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{home} vs {away}</p><p className="mt-1 text-xs text-slate-500">Elegiste: {pickLabel(bet)} · cuota {bet.odds.toFixed(2)}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusStyle}`}>{bet.status === 'pending' ? 'Pendiente' : bet.status === 'won' ? 'Acertada' : 'No acertada'}</span></div><div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-xs"><span className="text-slate-500">Apuesta: {bet.stake} cr</span><strong className="text-slate-700">{bet.status === 'won' ? `Cobro: ${bet.payout ?? 0} cr` : `Posible: ${Math.floor(bet.stake * bet.odds)} cr`}</strong></div></article>;
              }) : <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">Todavía no has confirmado una jugada.</p>}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">El saldo y las jugadas se guardan localmente en este navegador. Los créditos no tienen valor monetario y no se pueden retirar.</p>
          </aside>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wide text-[#047857]">Simulador de resultados</p><h2 className="mt-1 font-display text-xl font-bold text-[#0F172A]">Proyecta la tabla</h2><p className="mt-1 text-sm text-slate-600">Ingresa los goles que imaginas y mira cómo cambiarían las posiciones.</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetRound} disabled={!roundMatches.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RotateCcw className="h-4 w-4" /> Reiniciar fecha</button>
            <button type="button" onClick={savePredictions} disabled={!roundMatches.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#172E6E] disabled:opacity-50"><Save className="h-4 w-4" /> Guardar pronósticos</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-sm font-semibold text-slate-700">Fecha:</span>{rounds.map((round) => <button key={round} type="button" onClick={() => setSelectedRound(round)} aria-pressed={roundNumber === round} className={`min-h-9 rounded-lg px-3 text-sm font-semibold ${roundNumber === round ? 'bg-[#1E3A8A] text-white' : 'border border-[#CBD5E1] text-slate-700 hover:bg-slate-50'}`}>{round === 0 ? 'Por asignar' : round}</button>)}</div>
        {saved && <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">Pronósticos guardados en esta cuenta y navegador.</p>}
        {roundMatches.length ? <div className="mt-4 divide-y divide-[#E2E8F0]">{roundMatches.map((match) => {
          const home = clubMap.get(match.homeClubId); const away = clubMap.get(match.awayClubId);
          if (!home || !away) return null;
          const score = predictions[match.id] ?? { home: null, away: null };
          return <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-4 sm:gap-5"><div className="flex min-w-0 items-center justify-end gap-2 text-right"><span className="truncate text-sm font-semibold text-slate-800">{home.name}</span><ClubBadge club={home} size="sm" /></div><div className="flex items-center gap-2"><input aria-label={`Goles pronosticados para ${home.name}`} type="number" min="0" max="15" inputMode="numeric" value={score.home ?? ''} onChange={(event) => updateScore(match.id, 'home', event.target.value)} className="h-11 w-12 rounded-lg border border-[#CBD5E1] text-center font-mono text-lg font-bold text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-blue-100" /><span className="text-sm font-bold text-slate-400">–</span><input aria-label={`Goles pronosticados para ${away.name}`} type="number" min="0" max="15" inputMode="numeric" value={score.away ?? ''} onChange={(event) => updateScore(match.id, 'away', event.target.value)} className="h-11 w-12 rounded-lg border border-[#CBD5E1] text-center font-mono text-lg font-bold text-[#0F172A] focus:border-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-blue-100" /></div><div className="flex min-w-0 items-center gap-2"><ClubBadge club={away} size="sm" /><span className="truncate text-sm font-semibold text-slate-800">{away.name}</span></div><p className="col-span-3 -mt-2 text-center text-xs text-slate-500">{match.matchday === null ? 'Fecha por asignar' : `Fecha ${match.matchday}`} · {match.date} · {match.time}</p></div>;
        })}</div> : <div className="mt-5 rounded-xl border border-dashed border-[#CBD5E1] bg-slate-50 p-8 text-center"><p className="font-semibold text-slate-800">No hay partidos programados para pronosticar.</p><p className="mt-1 text-sm text-slate-600">Cuando haya una fecha abierta, aparecerá aquí.</p></div>}
        <p className="mt-4 text-xs text-slate-500">Los pronósticos solo afectan esta proyección; no modifican resultados oficiales.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-5 py-4"><TrendingUp className="h-5 w-5 text-[#047857]" /><div><h2 className="font-display font-bold text-[#0F172A]">Tabla simulada</h2><p className="text-xs text-slate-500">Barcelona aparece primero como favorito; su número mantiene el puesto real de la proyección</p></div><ArrowDownUp className="ml-auto h-4 w-4 text-slate-400" /></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Pos.</th><th className="px-4 py-3">Club</th><th className="px-3 py-3 text-center">PJ</th><th className="px-3 py-3 text-center">GF</th><th className="px-3 py-3 text-center">GC</th><th className="px-3 py-3 text-center">DG</th><th className="px-4 py-3 text-right">Pts</th></tr></thead><tbody className="divide-y divide-[#E2E8F0]">{projectedTable.map((row) => <tr key={row.club.id} className={`hover:bg-slate-50 ${isBarcelona(row.club.id) ? 'bg-yellow-50/60' : ''}`}><td className="px-4 py-3 font-mono font-semibold text-slate-500">{row.realPosition}</td><td className="px-4 py-3"><span className="flex items-center gap-2"><ClubBadge club={row.club} size="sm" /><span className="font-semibold text-slate-800">{row.club.name}</span>{isBarcelona(row.club.id) && <span className="text-xs" title="Equipo favorito">⭐</span>}</span></td><td className="px-3 py-3 text-center font-mono">{row.pj}</td><td className="px-3 py-3 text-center font-mono">{row.gf}</td><td className="px-3 py-3 text-center font-mono">{row.gc}</td><td className="px-3 py-3 text-center font-mono">{row.gf - row.gc}</td><td className="px-4 py-3 text-right font-mono font-bold">{row.pts}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
};
