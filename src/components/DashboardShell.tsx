import React from 'react';
import {
  BarChart3,
  CalendarDays,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  LogIn,
  ListOrdered,
  LogOut,
  Shield,
  Target,
  Users,
} from 'lucide-react';
import { AuthSession, NavSection } from '../types/tournament';
import { LigaProLogo } from './LigaProLogo';

interface DashboardShellProps {
  session: AuthSession;
  dataIsLive: boolean;
  authUser: { email: string; name?: string | null } | null;
  authConfigured: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  children: React.ReactNode;
}

const DESKTOP_NAV: {
  id: NavSection;
  label: string;
  mobileLabel: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'resumen',
    label: 'Panel Principal',
    mobileLabel: 'Inicio',
    icon: LayoutDashboard,
  },
  {
    id: 'posiciones',
    label: 'Tabla de Posiciones',
    mobileLabel: 'Tabla',
    icon: ListOrdered,
  },
  {
    id: 'fixture',
    label: 'Fixture y Resultados',
    mobileLabel: 'Fixture',
    icon: CalendarDays,
  },
  {
    id: 'clubes',
    label: 'Clubes y Plantillas',
    mobileLabel: 'Clubes',
    icon: Users,
  },
  {
    id: 'estadisticas',
    label: 'Estadísticas',
    mobileLabel: 'Stats',
    icon: BarChart3,
  },
  {
    id: 'actas',
    label: 'Actas y Resoluciones',
    mobileLabel: 'Actas',
    icon: FileText,
  },
  {
    id: 'pronosticos',
    label: 'Pronósticos y simulador',
    mobileLabel: 'Pronósticos',
    icon: Target,
  },
  {
    id: 'perfil',
    label: 'Mi perfil y roles',
    mobileLabel: 'Perfil',
    icon: CircleUserRound,
  },
];

// Bottom bar on mobile uses 5 ergonomic touch targets
const MOBILE_NAV = DESKTOP_NAV.filter(
  (item) => item.id !== 'estadisticas' && item.id !== 'actas',
);

export const DashboardShell: React.FC<DashboardShellProps> = ({
  session,
  dataIsLive,
  authUser,
  authConfigured,
  onOpenAuth,
  onSignOut,
  activeSection,
  onSelectSection,
  children,
}) => {
  const currentItem =
    DESKTOP_NAV.find((item) => item.id === activeSection) ?? DESKTOP_NAV[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Barra lateral izquierda fija en computadora (lg+) */}
      <aside
        aria-label="Navegación principal LigaPro"
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[#E2E8F0] lg:bg-white"
      >
        <div className="flex h-16 items-center border-b border-[#E2E8F0] px-5">
          <LigaProLogo variant="light" size="sm" />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {DESKTOP_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-slate-700 hover:bg-[#F8FAFC] hover:text-[#1E3A8A]'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-[#6EE7B7]' : 'text-slate-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bloque de sesión activa al pie de la barra lateral */}
        <div className="border-t border-[#E2E8F0] p-4">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#047857]">
              <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{session.roleLabel}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-[#0F172A] truncate">
              {authUser?.name || session.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{authUser?.email ?? session.email}</p>

            {authUser && (
              <button
                type="button"
                onClick={onSignOut}
                className="mt-3 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Contenedor principal */}
      <div className="lg:pl-64">
        {/* Encabezado superior fijo/sticky compacto */}
        <header className="sticky top-0 z-20 flex h-14 lg:h-16 items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden">
              <LigaProLogo variant="light" size="sm" />
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-slate-500">LigaPro Ecuador</span>
              <span className="text-slate-400" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-[#0F172A]">
                {currentItem.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-semibold text-slate-600">
              {authUser ? 'Cuenta conectada · consulta' : session.readOnly ? 'Vista pública' : session.roleLabel}
            </span>
            <button
              type="button"
              onClick={authUser ? onSignOut : onOpenAuth}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
            >
              {authUser ? <LogOut className="h-4 w-4" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
              <span>{authUser ? 'Cerrar sesión' : 'Entrar / crear cuenta'}</span>
            </button>
          </div>
        </header>

        {/* Área de contenido principal */}
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-12">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <span className="mt-0.5 shrink-0 font-bold" aria-hidden="true">{dataIsLive ? 'NEON' : 'DEMO'}</span>
            <p>
              {dataIsLive
                ? 'Conexión de lectura activa con Neon. Las áreas de administración requieren autenticación real.'
                : `Vista de demostración con datos de ejemplo. Configura DATABASE_URL en Netlify para conectar Neon.${authConfigured ? '' : ' Añade también VITE_NEON_AUTH_URL para habilitar el registro e inicio de sesión.'}`}
            </p>
          </div>
          {children}
        </main>
      </div>

      {/* Barra de navegación inferior fija en móvil (< lg) con botones táctiles amplios */}
      <nav
        aria-label="Navegación móvil"
        className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-6 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md lg:hidden"
      >
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[48px] flex-col items-center justify-center gap-1 px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1E3A8A] ${
                isActive ? 'text-[#1E3A8A]' : 'text-slate-600'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? 'text-[#1E3A8A]' : 'text-slate-500'
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-[11px] leading-none whitespace-nowrap ${
                  isActive ? 'font-bold text-[#1E3A8A]' : 'font-medium'
                }`}
              >
                {item.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
