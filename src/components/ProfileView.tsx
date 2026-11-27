import React, { FormEvent, useEffect, useState } from 'react';
import { BadgeCheck, CircleUserRound, LogOut, Shield, ShieldCheck, Trophy, UserRoundCog } from 'lucide-react';
import { AuthSession, Club, UserRole } from '../types/tournament';
import { PROFILE_AVATARS, UserProfileSettings } from '../types/profile';
import { ClubBadge } from './ClubBadge';

interface ProfileViewProps {
  user: { id: string; email: string; name?: string | null };
  session: AuthSession;
  clubs: Club[];
  profile: UserProfileSettings;
  canSaveProfile: boolean;
  profileUnavailableMessage: string;
  onSaveProfile: (profile: UserProfileSettings) => Promise<void>;
  onSignOut: () => void;
}

const ROLES: { id: UserRole; title: string; description: string }[] = [
  { id: 'publico', title: 'Aficionado', description: 'Consulta resultados, clubes y tabla. Participa en pronósticos con créditos ficticios.' },
  { id: 'delegado', title: 'Delegado de club', description: 'Gestiona plantillas y datos oficiales del club que le fue asignado.' },
  { id: 'comisario', title: 'Comisario', description: 'Registra resultados, incidencias y actas de los partidos asignados.' },
  { id: 'admin', title: 'Administrador LigaPro', description: 'Supervisa clubes, temporadas, usuarios y la operación oficial de la plataforma.' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ user, session, clubs, profile, canSaveProfile, profileUnavailableMessage, onSaveProfile, onSignOut }) => {
  const [form, setForm] = useState<UserProfileSettings>(profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setForm(profile), [profile]);

  const currentRole = ROLES.find((role) => role.id === session.role) ?? ROLES[0];
  const avatar = PROFILE_AVATARS.find((item) => item.id === form.avatarId) ?? PROFILE_AVATARS[0];
  const favoriteClub = clubs.find((club) => club.id === form.favoriteClubId);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await onSaveProfile({ ...form, displayName: form.displayName.trim() });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el perfil. Inténtalo otra vez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#047857]">Mi cuenta</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-[#0F172A]">Configurar mi cuenta</h1>
        <p className="mt-1 text-sm text-slate-600">Administra tu perfil, tu equipo favorito y consulta los permisos disponibles.</p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-[#D9E2F0] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0B1739] to-[#1E3A8A] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl" aria-label={`Avatar ${avatar.name}`}>
              {avatar.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Cuenta LigaPro</p>
              <h2 className="mt-1 truncate font-display text-2xl font-bold">{form.displayName || user.name || 'Aficionado'}</h2>
              <p className="mt-1 truncate text-sm text-blue-100">{user.email}</p>
              {favoriteClub && <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white"><ClubBadge club={favoriteClub} size="sm" /> Hincha de {favoriteClub.name}</div>}
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

      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-[#1E3A8A]"><UserRoundCog className="h-5 w-5" /></div>
            <div><h2 className="font-display text-lg font-bold text-[#0F172A]">Datos y preferencias</h2>
            <p className="mt-1 text-sm text-slate-600">Estos cambios se guardan en tu perfil de Neon.</p></div>
          </div>
        </div>
        <form onSubmit={handleSave} className="mt-5 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">
            Nombre para mostrar
            <input
              type="text"
              maxLength={60}
              disabled={!canSaveProfile}
              value={form.displayName}
              onChange={(event) => { setSaved(false); setForm((current) => ({ ...current, displayName: event.target.value })); }}
              placeholder={user.name || 'Escribe tu nombre'}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Equipo favorito
            <select
              value={form.favoriteClubId}
              onChange={(event) => { setSaved(false); setForm((current) => ({ ...current, favoriteClubId: event.target.value })); }}
              disabled={!canSaveProfile}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Todavía no elijo un equipo</option>
              {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-slate-700">Avatar</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROFILE_AVATARS.map((option) => {
                const selected = option.id === form.avatarId;
                return <button
                  key={option.id}
                  type="button"
                  aria-label={`Elegir avatar ${option.name}`}
                  aria-pressed={selected}
                  disabled={!canSaveProfile}
                  onClick={() => { setSaved(false); setForm((current) => ({ ...current, avatarId: option.id })); }}
                  className={`flex h-14 w-14 items-center justify-center rounded-xl border text-2xl transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'border-[#1E3A8A] bg-blue-50 ring-2 ring-blue-200' : 'border-[#CBD5E1] bg-white hover:bg-slate-50'}`}
                >{option.emoji}</button>;
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">Puedes cambiar tu avatar cuando quieras.</p>
          </fieldset>

          {!canSaveProfile && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{profileUnavailableMessage || 'Comprobando la conexión del perfil con Neon…'}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          {saved && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Perfil guardado en Neon.</p>}
          <button type="submit" disabled={saving || !canSaveProfile} className="min-h-11 rounded-lg bg-[#1E3A8A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#172E6E] disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-[#1E3A8A]"><Trophy className="h-5 w-5" /></div>
          <div><h2 className="font-display text-lg font-bold text-[#0F172A]">Roles de la plataforma</h2><p className="mt-1 text-sm text-slate-600">Tu rol actual es {currentRole.title}. Los roles oficiales requieren asignación autorizada.</p></div>
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
