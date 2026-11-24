import React from 'react';

interface LigaProLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const LigaProLogo: React.FC<LigaProLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = false,
}) => {
  const isDarkSurface = variant === 'dark';

  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <div
        className={`${iconSizes[size]} shrink-0 flex items-center justify-center rounded-xl ${
          isDarkSurface
            ? 'bg-white/10 border border-white/20'
            : 'bg-[#1E3A8A] border border-[#1E3A8A]'
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7"
        >
          {/* Institutional Shield */}
          <path
            d="M20 4L33 9.2V19.6C33 27.6 27.4 33.8 20 36C12.6 33.8 7 27.6 7 19.6V9.2L20 4Z"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Football Geometric Pentagon Core */}
          <path
            d="M20 12.5L25.8 16.7L23.6 23.5H16.4L14.2 16.7L20 12.5Z"
            fill="#10B981"
          />
          {/* Equator Meridian Line */}
          <path
            d="M10.5 18.2H14.5M25.5 18.2H29.5"
            stroke="#FACC15"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="20" cy="18.5" r="2.2" fill="#FFFFFF" />
        </svg>
      </div>

      <div className="min-w-0">
        <div
          className={`font-display font-extrabold tracking-tight leading-none whitespace-nowrap ${
            titleSizes[size]
          } ${isDarkSurface ? 'text-white' : 'text-[#0F172A]'}`}
        >
          LigaPro{' '}
          <span className={isDarkSurface ? 'text-[#34D399]' : 'text-[#1E3A8A]'}>
            Ecuador
          </span>
        </div>
        {showSubtitle && (
          <p
            className={`mt-1 text-xs font-medium tracking-wide whitespace-nowrap ${
              isDarkSurface ? 'text-blue-200' : 'text-slate-600'
            }`}
          >
            Serie A · Serie B · Gestión Oficial
          </p>
        )}
      </div>
    </div>
  );
};
