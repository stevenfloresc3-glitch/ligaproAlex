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
        className={`${iconSizes[size]} shrink-0 overflow-hidden rounded-xl border border-white/70 bg-white shadow-sm`}
      >
        <img src="/images/ligapro-logo-oficial.png" alt="" className="h-full w-full object-cover object-top" />
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
