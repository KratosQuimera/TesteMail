import React from 'react';

interface OswaldoCruzLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const OswaldoCruzLogo: React.FC<OswaldoCruzLogoProps> = ({ 
  className = '', 
  showText = true,
  size = 'md',
  variant = 'light'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Segmented Pinwheel / C-Circle Icon */}
      <div className={`relative shrink-0 ${iconSizes[size]} flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xs">
          {/* Top Right Arc Segment (Vibrant Cyan / Teal) */}
          <path
            d="M 50 10 A 40 40 0 0 1 90 50 L 66 50 A 16 16 0 0 0 50 34 Z"
            fill="#00A9B5"
          />
          
          {/* Top Left Arc Segment (Medium Petrol Teal) */}
          <path
            d="M 50 10 A 40 40 0 0 0 10 50 L 34 50 A 16 16 0 0 1 50 34 Z"
            fill="#008E9B"
          />
          
          {/* Bottom Left Arc Segment (Deep Petrol Blue) */}
          <path
            d="M 10 50 A 40 40 0 0 0 50 90 L 50 66 A 16 16 0 0 1 34 50 Z"
            fill="#073B4C"
          />

          {/* Bottom Right Small Wedge / Accent (Dark Petrol) */}
          <path
            d="M 50 66 A 16 16 0 0 1 50 66 L 50 90 A 40 40 0 0 0 68 84 L 56 68 A 16 16 0 0 1 50 66 Z"
            fill="#0B2530"
          />

          {/* Center White Cutout Dot */}
          <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span 
              className="text-base sm:text-lg font-black tracking-tight uppercase"
              style={{ color: '#00A9B5', letterSpacing: '-0.02em', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              OSWALDO CRUZ
            </span>
          </div>
          <span 
            className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.25em] leading-tight mt-0.5 ${
              variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            HOSPITAL ALEMÃO
          </span>
        </div>
      )}
    </div>
  );
};
