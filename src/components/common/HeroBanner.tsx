import React from 'react';
import { 
  Building2, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  CalendarDays, 
  Users2,
  Sliders,
  UtensilsCrossed
} from 'lucide-react';
import { UserAccount } from '../../types';

interface HeroBannerProps {
  currentUser?: UserAccount | null;
  onOpenSettings?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ currentUser, onOpenSettings }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 mb-6 bg-slate-950 text-white group w-full max-w-full">
      {/* Background Image with Aerial Drone View of PLTU Teluk Sirih */}
      <img
        src="/bg-teluk-sirih.jpg"
        alt="Lanskap PLTU Teluk Sirih"
        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-1000 opacity-90"
      />
      
      {/* Multi-stage Gradient Overlays for optimal readability and depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/20" />

      {/* Decorative ambient subtle glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 p-4 sm:p-8 lg:p-10 flex flex-col justify-between min-h-[200px] w-full max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-cyan-500 text-slate-950 shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>PLTU TELUK SIRIH</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20">
                <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                <span>Teluk Kabung, Kota Padang</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                ● Unit Pembangkitan 2 x 112 MW
              </span>
            </div>

            {/* Title & Description */}
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-md break-words">
              Sistem Terpadu Pemesanan Ruang Rapat & Konsumsi
            </h1>
            <div className="space-y-1 text-xs sm:text-sm text-slate-200/90 leading-relaxed font-normal pt-0.5 break-words">
              <p>
                Selamat datang, <strong className="text-cyan-300">{currentUser?.name || 'Karyawan'}</strong> (Bagian {currentUser?.department || 'UPK Teluk Sirih'}).
              </p>
              <p className="text-slate-300/95">
                Silakan lakukan reservasi ruang rapat dan paket konsumsi meeting.
              </p>
            </div>
          </div>

          {/* Quick Action Button for Background Setting */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer hover:shadow-md hover:border-cyan-400/50 shrink-0"
              title="Atur tampilan visual background"
            >
              <Sliders className="w-4 h-4 text-cyan-300" />
              <span>Ganti Latar</span>
            </button>
          )}
        </div>

        {/* Feature Highlights Footer Bar */}
        <div className="mt-5 sm:mt-6 pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs w-full">
          <div className="flex items-center gap-2 text-slate-200 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-cyan-300 shrink-0">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
            <span className="truncate font-medium">Cek Jadwal Real-time</span>
          </div>

          <div className="flex items-center gap-2 text-slate-200 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
            <span className="truncate font-medium">Snack & Makan</span>
          </div>

          <div className="flex items-center gap-2 text-slate-200 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="truncate font-medium">Verifikasi Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
