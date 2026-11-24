import React from 'react';
import { BadgeCheck, CircleUserRound, LogOut, Shield, ShieldCheck, Trophy } from 'lucide-react';
import { AuthSession, UserRole } from '../types/tournament';

interface ProfileViewProps {
  user: { id: string; email: string; name?: string | null };
  session: AuthSession;
  onSignOut: () => void;
}

const ROLES: { id: UserRole; title: string; description: string }[] = [
  { id: 'publico', title: 'Aficionado', description: 'Consulta resultados, clubes y tabla. Participa en pronósticos con créditos ficticios.' },
  { id: 'delegado', title: 'Delegado de club', description: 'Gestiona plantillas y datos oficiales del club que le fue asignado.' },
  { id: 'comisario', title: 'Comisario', description: 'Registra resultados, incidencias y actas de los partidos asignados.' },
  { id: 'admin', title: 'Administrador LigaPro', description: 'Supervisa clubes, temporadas, usuarios y la operación oficial de la plataforma.' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ user, session, onSignOut }) => {
  const currentRole = ROLES.find((role) => role.id === session.role) ?? ROLES[0];
  const initials = (user.name || user.email).trim().slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#047857]">Mi cuenta</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-[#0F172A]">Perfil y roles</h1>
        <p className="mt-1 text-sm text-slate-600">Consulta tus datos y los permisos disponibles en LigaPro Ecuador.</p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#D9E2F0] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0B1739] to-[#1E3A8A] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-extrabold text-emerald-300">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Cuenta LigaPro</p>
              <h2 className="mt-1 truncate font-display text-2xl font-bold">{user.name || 'Aficionado'}</h2>
              <p className="mt-1 truncate text-sm text-blue-100">{user.email}</p>
            </div>
            <button type="button" onClick={onSignOut} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"><LogOut className="h-4 w-4" />Cerrar sesión</button>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div className="rounded-xl border border-[#E2E8F0] p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><CircleUserRound className="h-4 w-4" />Correo de la cuenta</p>
            <p className="mt-2 break-all text-sm font-semibold text-[#0F172A]">{user.email}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800"><ShieldCheck className="h-4 w-4" />Tu rol asignado</p>
            <p className="mt-2 text-sm font-bold text-emerald-950">{currentRole.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-900">{currentRole.description}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-[#1E3A8A]"><Trophy className="h-5 w-5" /></div>
          <div><h2 className="font-display text-lg font-bold text-[#0F172A]">Roles de la plataforma</h2><p className="mt-1 text-sm text-slate-600">Tu cuenta actualmente tiene permisos de aficionado. Los roles oficiales requieren asignación de un administrador.</p></div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => {
            const active = role.id === currentRole.id;
            return <article key={role.id} className={`rounded-xl border p-4 ${active ? 'border-emerald-300 bg-emerald-50/70' : 'border-[#E2E8F0] bg-white'}`}>
              <div className="flex items-center justify-between gap-3"><h3 className="font-bold text-[#0F172A]">{role.title}</h3>{active ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-900"><BadgeCheck className="h-3.5 w-3.5" />Tu rol</span> : <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-500"><Shield className="h-3.5 w-3.5" />Restringido</span>}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{role.description}</p>
            </article>;
          })}
        </div>
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">El registro no permite que una cuenta se eleve a rol de delegado, comisario o administrador. La asignación debe validarse en el servidor para proteger las funciones oficiales.</p>
      </section>
    </div>
  );
};
