import React from 'react';
import { Club } from '../types/tournament';

interface ClubBadgeProps {
  club: Pick<Club, 'shortName' | 'primaryColor' | 'secondaryColor' | 'name'>;
  size?: 'sm' | 'md' | 'lg';
}

export const ClubBadge: React.FC<ClubBadgeProps> = ({ club, size = 'md' }) => {
  const dims = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-[11px]',
    lg: 'w-12 h-12 text-xs',
  };

  // Determine high-contrast text color on club's primaryColor
  const lightPrimary = ['#FFFFFF', '#FACC15', '#EAB308'].includes(
    club.primaryColor.toUpperCase()
  );
  const normalizedName = club.name.toLowerCase();
  const crest = normalizedName.includes('independiente')
    ? 'independiente_del_valle'
    : normalizedName.includes('liga de quito')
      ? 'ldu_quito'
      : normalizedName.includes('barcelona')
        ? 'barcelona'
        : normalizedName.includes('católica') || normalizedName.includes('catolica')
          ? 'universidad_catolica'
          : normalizedName.includes('aucas')
            ? 'aucas'
            : normalizedName.includes('mushuc')
              ? 'mushuc_runa'
              : normalizedName.includes('nacional')
                ? 'nacional'
                : normalizedName.includes('emelec')
                  ? 'emelec'
                  : normalizedName.includes('cuenca')
                    ? 'cuenca'
                    : normalizedName.includes('macará') || normalizedName.includes('macara')
                      ? 'macara'
                      : normalizedName.includes('libertad')
                        ? 'libertad'
                        : normalizedName.includes('técnico') || normalizedName.includes('tecnico')
                          ? 'tecnico_universitario'
                          : normalizedName.includes('delfín') || normalizedName.includes('delfin')
                            ? 'delfin'
                            : normalizedName.includes('orense')
                              ? 'orense'
                              : normalizedName.includes('cumbayá') || normalizedName.includes('cumbaya')
                                ? 'cumbaya'
                                : normalizedName.includes('gualaceo')
                                  ? 'gualaceo'
                                  : normalizedName.includes('guayaquil city')
                                    ? 'guayaquil_city'
                                    : normalizedName.includes('imbabura')
                                      ? 'imbabura'
                                      : null;

  return (
    <div
      className={`${dims[size]} shrink-0 rounded-lg border border-slate-200 flex items-center justify-center font-display font-bold tracking-tight relative overflow-hidden`}
      style={{
        backgroundColor: club.primaryColor,
        color: lightPrimary ? '#0F172A' : '#FFFFFF',
      }}
      title={club.name}
      aria-hidden="true"
    >
      {crest ? (
        <img
          src={`/logos/${crest}.png`}
          alt=""
          className="h-full w-full object-contain p-0.5"
          loading="lazy"
        />
      ) : (
        <>
          <span
            className="absolute inset-x-0 bottom-0 h-1.5"
            style={{ backgroundColor: club.secondaryColor }}
          />
          <span className="relative z-10 -mt-0.5">{club.shortName.slice(0, 3)}</span>
        </>
      )}
    </div>
  );
};
