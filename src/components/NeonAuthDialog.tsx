import React, { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { authClient } from '../lib/auth';
import { LigaProLogo } from './LigaProLogo';

export interface NeonUser {
  id: string;
  email: string;
  name?: string | null;
}

interface NeonAuthDialogProps {
  required?: boolean;
  onClose: () => void;
  onAuthenticated: (user: NeonUser) => void;
}

export const NeonAuthDialog: React.FC<NeonAuthDialogProps> = ({ required = false, onClose, onAuthenticated }) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!authClient) {
      setError('Falta configurar VITE_NEON_AUTH_URL en este entorno.');
      return;
    }

    setPending(true);
    try {
      const result = mode === 'signup'
        ? await authClient.signUp.email({
            name: email.trim().split('@')[0] || 'Usuario LigaPro',
            email: email.trim(),
            password,
          })
        : await authClient.signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message || 'No se pudo completar la solicitud.');
        return;
      }

      const sessionResult = await authClient.getSession();
      const currentUser = sessionResult.data?.user;
      if (currentUser) {
        onAuthenticated({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
        });
      } else if (mode === 'signup') {
        setNotice('Cuenta creada. Si Neon solicita verificar el correo, revisa tu bandeja de entrada.');
      } else {
        setError(sessionResult.error?.message || 'No se pudo recuperar la sesión. Intenta de nuevo.');
      }
    } catch {
      setError('No se pudo conectar con Neon Auth. Revisa la URL de autenticación y los dominios permitidos.');
    } finally {
      setPending(false);
    }
  };

  return (
    <main className={required ? 'relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1739] px-4 py-10 sm:px-6' : 'fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4'}>
      {required && (
        <>
          <div className="pointer-events-none absolute -left-32 -top-40 h-96 w-96 rounded-full bg-[#1E3A8A]/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 -right-24 h-[32rem] w-[32rem] rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute left-5 top-6 sm:left-10 sm:top-9"><LigaProLogo variant="dark" size="sm" showSubtitle /></div>
        </>
      )}
      <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className={`relative w-full ${required ? 'mt-16 max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl lg:grid lg:grid-cols-[1fr_1fr]' : 'max-w-md rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl'} p-6 sm:p-8`}>
        {required && (
          <div className="hidden flex-col justify-between bg-gradient-to-br from-[#142B65] via-[#0B1739] to-[#071127] p-10 text-white lg:flex">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">La pasión del fútbol ecuatoriano</p>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight">Todo LigaPro,<br />en un solo lugar.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-blue-100/80">Consulta clubes, calendario y posiciones. Pronostica resultados y compite con créditos virtuales.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Tu equipo destacado</p>
              <p className="mt-2 text-2xl font-extrabold">Barcelona SC <span aria-hidden="true">⭐</span></p>
              <p className="mt-1 text-sm text-blue-100/75">El Ídolo del Astillero</p>
            </div>
          </div>
        )}
        <div className={required ? 'p-2 sm:p-4 lg:p-3' : ''}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#047857]">Cuenta LigaPro</p>
            <h2 id="auth-title" className="mt-1 font-display text-2xl font-bold text-[#0F172A]">
              {mode === 'signup' ? 'Crea tu cuenta' : 'Qué bueno verte de nuevo'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{mode === 'signup' ? 'Regístrate para entrar al panel y hacer tus pronósticos.' : 'Ingresa con el correo y la contraseña de tu cuenta.'}</p>
          </div>
          {!required && <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>}
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => { setMode('signup'); setError(null); setNotice(null); }} aria-pressed={mode === 'signup'} className={`min-h-10 rounded-lg px-3 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600'}`}>Registrarme</button>
          <button type="button" onClick={() => { setMode('signin'); setError(null); setNotice(null); }} aria-pressed={mode === 'signin'} className={`min-h-10 rounded-lg px-3 text-sm font-semibold ${mode === 'signin' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600'}`}>Ya tengo cuenta</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Correo electrónico
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100" placeholder="nombre@correo.com" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Contraseña
            <input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-lg border border-[#CBD5E1] px-3 text-sm font-normal text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100" placeholder="Al menos 8 caracteres" />
          </label>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          {notice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

          <button type="submit" disabled={pending} className="min-h-11 w-full rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#172E6E] disabled:cursor-wait disabled:opacity-60">
            {pending ? 'Conectando…' : mode === 'signup' ? 'Crear cuenta con correo' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Las apuestas usan créditos virtuales; no hay depósitos ni premios en dinero real. Las cuentas nuevas tienen acceso de consulta y no habilitan funciones oficiales de gestión.
        </p>
        </div>
      </section>
    </main>
  );
};
