import React from 'react';

interface SiApinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPlnLogo?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const SiApinLogo: React.FC<SiApinLogoProps> = ({
  className = '',
  size = 'md',
  showPlnLogo = true,
}) => {
  // Height sizing classes for the SI APIN logo
  const apinSizeClasses = {
    sm: 'h-6 sm:h-8 max-w-[110px] sm:max-w-none',
    md: 'h-7 sm:h-9 md:h-11 max-w-[130px] sm:max-w-none',
    lg: 'h-10 sm:h-13 md:h-15 max-w-[160px] sm:max-w-none',
    xl: 'h-12 sm:h-18 md:h-20 max-w-[200px] sm:max-w-none',
  };

  // Height sizing classes for the PLN logo
  const plnSizeClasses = {
    sm: 'h-4 sm:h-6 max-w-[60px] sm:max-w-none',
    md: 'h-5 sm:h-7 md:h-9 max-w-[70px] sm:max-w-none',
    lg: 'h-7 sm:h-10 md:h-12 max-w-[90px] sm:max-w-none',
    xl: 'h-9 sm:h-14 md:h-16 max-w-[110px] sm:max-w-none',
  };

  return (
    <div className={`inline-flex items-center select-none gap-1 sm:gap-3 shrink min-w-0 max-w-full overflow-hidden ${className}`}>
      {/* PLN Logo */}
      {showPlnLogo && (
        <>
          <img
            src="/pln-logo.png"
            alt="PT PLN (Persero)"
            className={`${plnSizeClasses[size]} w-auto object-contain drop-shadow-2xs transition-transform duration-200 shrink-0`}
            loading="eager"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('login-pln-logo.png')) {
                target.src = '/login-pln-logo.png';
              }
            }}
          />
          {/* Subtle elegant divider */}
          <div className="h-4 sm:h-7 w-px bg-slate-300/80 shrink-0 mx-0.5" />
        </>
      )}

      {/* SI APIN Logo */}
      <img
        src="/si-apin-logo.png"
        alt="SI APIN - Sistem Terpadu Pemesanan Ruang Meeting dan Konsumsi"
        className={`${apinSizeClasses[size]} w-auto object-contain drop-shadow-2xs transition-transform duration-200 shrink min-w-0`}
        loading="eager"
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('login-siapin-logo.png')) {
            target.src = '/login-siapin-logo.png';
          }
        }}
      />
    </div>
  );
};
