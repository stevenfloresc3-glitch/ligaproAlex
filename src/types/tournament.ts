export type UserRole = 'admin' | 'comisario' | 'delegado' | 'publico';

export interface AuthSession {
  role: UserRole;
  name: string;
  email: string;
  roleLabel: string;
  clubId?: string;
  readOnly: boolean;
}

export type QualificationZone =
  | 'libertadores'
  | 'sudamericana'
  | 'permanencia'
  | 'descenso';

export type FormResult = 'G' | 'E' | 'P';

export interface Club {
  id: string;
  name: string;
  shortName: string;
  city: string;
  stadium: string;
  coach: string;
  primaryColor: string;
  secondaryColor: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  form: FormResult[];
}

export type MatchStatus = 'Finalizado' | 'En curso' | 'Programado';
export type ActaStatus = 'Aprobada' | 'Pendiente' | 'En revisión';

export interface Match {
  id: string;
  matchday: number;
  date: string;
  time: string;
  stadium: string;
  city: string;
  homeClubId: string;
  awayClubId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  referee: string;
  comisario: string;
  actaStatus: ActaStatus;
  attendance?: number;
  observations?: string;
}

export interface PlayerStat {
  id: string;
  name: string;
  clubId: string;
  position: 'Delantero' | 'Mediocampista' | 'Defensa' | 'Arquero';
  number: number;
  goals: number;
  assists: number;
  matches: number;
  yellowCards: number;
  redCards: number;
}

export interface OfficialResolution {
  id: string;
  code: string;
  date: string;
  title: string;
  category: 'Comité Disciplinario' | 'Dirección de Competiciones' | 'Comisión Arbitral';
  summary: string;
  status: 'Vigente' | 'En apelación' | 'Ejecutada';
}

export type NavSection =
  | 'resumen'
  | 'posiciones'
  | 'fixture'
  | 'clubes'
  | 'estadisticas'
  | 'actas'
  | 'pronosticos'
  | 'perfil';
